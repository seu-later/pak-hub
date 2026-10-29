local addresses = {
    muzzle = nil,
    cryo = nil,
    flame = nil,
    projectile = nil,
    zipline = nil,
    cave = nil,
}
local applied = false
local MUZZLE_PATTERN =
    '48 89 5C 24 08 57 48 83 EC 20 ' ..
    '65 48 8B 04 25 58 00 00 00 48 8B F9 ' ..
    '44 8B 05 ?? ?? ?? ?? 48 8B DA B9 18 01 00 00 ' ..
    '4E 8B 04 C0 42 8B 04 01 39 05 ?? ?? ?? ?? 7F ?? ' ..
    '48 8B 07 48 8B CF FF 90 00 08 00 00 ' ..
    '4C 8B 05 ?? ?? ?? ?? 45 33 C9 48 8B D3 48 8B C8 ' ..
    '4C 8B 10 41 FF 92 28 04 00 00 48 8B C3'
local CRYO_DAMAGE_PATTERN =
    '89 44 24 58 48 8B 07 FF 90 A8 09 00 00'
local FLAME_DAMAGE_PATTERN =
    '89 44 24 58 48 8B 07 FF 90 B0 09 00 00'
local PROJECTILE_PATTERN =
    'FF 50 30 45 0F 10 0C 24 45 0F 57 ED 41 0F 10 4C 24 10'
local ZIPLINE_PATTERN =
    'FF 50 30 F3 0F 10 4D 84 48 8D 8B B8 00 00 00'
local CAVE_OFFSET = 48
local CAVE_SIZE = 512
local CAVE_PATTERN =
    '54 24 20 4C 89 5C 24 28 4C 89 64 24 30 48 89 4C ' ..
    '24 38 FF 15 ?? ?? ?? ?? ' ..
    'B8 01 00 00 00 48 83 C4 40 9D 41 5F ' ..
    '41 5E 41 5D 41 5C 5D 5B 5F 5E F3 C3 ' ..
    string.rep('CC ', CAVE_SIZE)
local MUZZLE_EPILOGUE_OFFSET = 0x5B
local hooks = {
    muzzle = {
        bytes = {
            0x48, 0x8B, 0xC3, 0x48, 0x8B, 0x5C, 0x24,
            0x30, 0x48, 0x83, 0xC4, 0x20, 0x5F, 0xC3,
        },
        label = 'muzzle_stub',
    },
    cryo = {
        bytes = { 0x89, 0x44, 0x24, 0x58, 0x48, 0x8B, 0x07 },
        label = 'cryo_stub',
    },
    flame = {
        bytes = { 0x89, 0x44, 0x24, 0x58, 0x48, 0x8B, 0x07 },
        label = 'flame_stub',
    },
    projectile = {
        bytes = { 0xFF, 0x50, 0x30, 0x45, 0x0F, 0x10, 0x0C, 0x24 },
        label = 'projectile_stub',
    },
    zipline = {
        bytes = { 0xFF, 0x50, 0x30, 0xF3, 0x0F, 0x10, 0x4D, 0x84 },
        label = 'zipline_stub',
    },
}
local function expect(ctx, addr, expected)
    for i, byte in ipairs(expected) do
        if ctx[addr + i - 1] ~= byte then
            return false, i
        end
    end
    return true
end
local function write_i32(ctx, addr, value)
    value = value & 0xFFFFFFFF
    for i = 0, 3 do
        ctx[addr + i] = (value >> (i * 8)) & 0xFF
    end
end
local function assemble(ctx, base, source, symbols)
    local bytes = {}
    local fixups = {}
    local labels = {}
    for line in source:gmatch('[^\n]*') do
        line = line:gsub('%-%-.*', ''):match('^%s*(.-)%s*$')
        if line ~= '' then
            local label = line:match('^([%w_]+):$')
            if label then
                labels[label] = #bytes
            else
                for token in line:gmatch('%S+') do
                    local symbol = token:match('^{(.+)}$')
                    if symbol then
                        fixups[#fixups + 1] = { offset = #bytes, symbol = symbol }
                        for _ = 1, 4 do bytes[#bytes + 1] = 0 end
                    elseif token:match('^%x%x$') then
                        bytes[#bytes + 1] = tonumber(token, 16)
                    else
                        error("camera_shot_origin: invalid assembly token '" .. token .. "'")
                    end
                end
            end
        end
    end
    if #bytes > CAVE_SIZE then
        error(('camera_shot_origin: code cave overflow (%d > %d)'):format(#bytes, CAVE_SIZE))
    end
    for i, byte in ipairs(bytes) do
        ctx[base + i - 1] = byte
    end
    for _, fixup in ipairs(fixups) do
        local target = labels[fixup.symbol]
        if target ~= nil then target = base + target end
        if target == nil then target = symbols[fixup.symbol] end
        if target == nil then
            error("camera_shot_origin: unresolved symbol '" .. fixup.symbol .. "'")
        end
        write_i32(ctx, base + fixup.offset, target - (base + fixup.offset + 4))
    end
    local absolute_labels = {}
    for name, offset in pairs(labels) do
        absolute_labels[name] = base + offset
    end
    return #bytes, absolute_labels
end
local function write_cave(ctx, base, rejoins)
    local source = [[
    camera_origin:
        48 85 C9
        0F 84 {camera_done}
        48 8B 81 E0 02 00 00
        48 85 C0
        0F 84 {camera_done}
        48 8B 80 A0 0A 00 00
        48 85 C0
        0F 84 {camera_done}
        F2 0F 10 80 D0 01 00 00
        F2 0F 11 02
        F3 0F 10 80 D8 01 00 00
        B8 00 00 C8 41
        66 0F 6E C8
        F3 0F 58 C1
        F3 0F 11 42 08
    camera_done:
        C3
    shift_damage_line:
        48 85 C9
        0F 84 {shift_done}
        48 85 D2
        0F 84 {shift_done}
        4D 85 C0
        0F 84 {shift_done}
        48 8B 81 E0 02 00 00
        48 85 C0
        0F 84 {shift_done}
        48 8B 80 A0 0A 00 00
        48 85 C0
        0F 84 {shift_done}
        F2 0F 10 80 D0 01 00 00
        F2 0F 10 0A
        0F 5C C1
        F2 41 0F 10 10
        0F 58 D0
        F2 41 0F 11 10
        0F 58 C1
        F2 0F 11 02
        F3 0F 10 80 D8 01 00 00
        B8 00 00 C8 41
        66 0F 6E C8
        F3 0F 58 C1
        F3 0F 5C 42 08
        F3 41 0F 10 48 08
        F3 0F 58 C8
        F3 41 0F 11 48 08
        F3 0F 58 42 08
        F3 0F 11 42 08
    shift_done:
        C3
    muzzle_stub:
        48 8B CF
        48 8D 53 10
        E8 {camera_origin}
        48 8B C3
        48 8B 5C 24 30
        48 83 C4 20
        5F
        C3
    cryo_stub:
        89 44 24 58
        48 8B CF
        48 8D 54 24 50
        4C 8D 44 24 40
        E8 {shift_damage_line}
        48 8B CF
        48 8D 54 24 50
        4C 8D 44 24 40
        48 8B 07
        E9 {cryo_rejoin}
    flame_stub:
        89 44 24 58
        48 8B CF
        48 8D 54 24 50
        4C 8D 44 24 40
        E8 {shift_damage_line}
        48 8B CF
        48 8D 54 24 50
        4C 8D 44 24 40
        48 8B 07
        E9 {flame_rejoin}
    projectile_stub:
        FF 50 30
        48 8B 8B F8 00 00 00
        48 8D 54 24 60
        E8 {camera_origin}
        45 0F 10 0C 24
        E9 {projectile_rejoin}
    zipline_stub:
        FF 50 30
        48 8B 8B F8 00 00 00
        48 8D 54 24 70
        E8 {camera_origin}
        F3 0F 10 4D 84
        E9 {zipline_rejoin}
    ]]
    return assemble(ctx, base, source, rejoins)
end
local function all_addresses_found()
    local required = { 'muzzle', 'cryo', 'flame', 'projectile', 'zipline', 'cave' }
    for _, name in ipairs(required) do
        if not addresses[name] then return false end
    end
    return true
end
local function try_apply(ctx)
    if applied or not all_addresses_found() then return end
    local hook_addresses = {}
    for name in pairs(hooks) do
        hook_addresses[name] = addresses[name]
    end
    hook_addresses.muzzle = hook_addresses.muzzle + MUZZLE_EPILOGUE_OFFSET
    for name, hook in pairs(hooks) do
        local ok, bad_index = expect(ctx, hook_addresses[name], hook.bytes)
        if not ok then
            print(('camera_shot_origin: %s hook mismatch at byte %d; NOTHING written')
                :format(name, bad_index))
            return
        end
    end
    for i = 0, CAVE_SIZE - 1 do
        if ctx[addresses.cave + i] ~= 0xCC then
            print(('camera_shot_origin: code cave occupied at +%X; NOTHING written'):format(i))
            return
        end
    end
    local rejoins = {}
    for name, hook in pairs(hooks) do
        rejoins[name .. '_rejoin'] = hook_addresses[name] + #hook.bytes
    end
    local written, labels = write_cave(ctx, addresses.cave, rejoins)
    for name, hook in pairs(hooks) do
        local addr = hook_addresses[name]
        local target = labels[hook.label]
        ctx[addr] = 0xE9
        write_i32(ctx, addr + 1, target - (addr + 5))
        for i = 5, #hook.bytes - 1 do
            ctx[addr + i] = 0x90
        end
    end
    applied = true
    print(('camera_shot_origin: camera origin enabled for muzzle, projectile, zipline, and client continuous RPC paths (%d-byte cave)')
        :format(written))
end
local function capture(name, offset)
    return function(ctx)
        addresses[name] = ctx:address() + (offset or 0)
        try_apply(ctx)
    end
end
return {
    { pattern = MUZZLE_PATTERN, match = capture('muzzle') },
    { pattern = CRYO_DAMAGE_PATTERN, match = capture('cryo') },
    { pattern = FLAME_DAMAGE_PATTERN, match = capture('flame') },
    { pattern = PROJECTILE_PATTERN, match = capture('projectile') },
    { pattern = ZIPLINE_PATTERN, match = capture('zipline') },
    { pattern = CAVE_PATTERN, match = capture('cave', CAVE_OFFSET) },
}
