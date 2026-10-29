-- bitfix/aggro_cap.lua

--- O(N^2) per target per tick
local MAX_ATTACKERS = 64

local PATTERN =
    'CC CC CC CC CC CC CC CC CC CC CC CC CC CC CC ' .. -- 15 bytes of alignment padding
    'F3 0F 10 54 24 28 ' ..                            -- movss  xmm2, [rsp+28h]  (attacker radius)
    'F3 0F 58 91 F8 00 00 00 ' ..                      -- addss  xmm2, [rcx+0F8h] (personal sphere)
    '49 63 C1 ' ..                                     -- movsxd rax, r9d         (the slot)
    '4C 8D 0C 40 ' ..                                  -- lea    r9, [rax+rax*2]  (3 floats/entry)
    '0F 28 C2 ' ..                                     -- movaps xmm0, xmm2
    '48 8B 05 B9'                                      -- mov    rax, [rip+..]    (the ring table)

local function bytes(hex)
    local t = {}
    for h in hex:gmatch('%x%x') do t[#t + 1] = tonumber(h, 16) end
    return t
end


local SITES = {
    { 0x3,     'CC CC CC CC CC CC CC CC CC CC CC CC', '41 83 E1 1F F3 0F 10 54 24 28 EB 06', 'ground getter head' },
    { 0xF,     'F3 0F 10 54 24 28',                   'EB F2 0F 1F 40 00',                   'ground getter entry' },

    { 0x97E4,  '3B 9F B4 00 00 00',                   '81 FB 20 00 00 00',                   'flying bound 1' },
    { 0x9982,  '8B 87 B4 00 00 00',                   'B8 20 00 00 00 90',                   'flying bound 2' },
    { 0x9B16,  '8B 87 B4 00 00 00',                   'B8 20 00 00 00 90',                   'flying bound 3' },
    { 0x9CB6,  '44 8B A7 B4 00 00 00',                '41 BC 20 00 00 00 90',                'flying bound 4' },
    { 0x9D98,  '44 8B A7 B4 00 00 00',                '41 BC 20 00 00 00 90',                'flying bound 5' },
    { 0x9E83,  '44 8B A7 B4 00 00 00',                '41 BC 20 00 00 00 90',                'flying bound 6' },
    { 0x9F6E,  '44 8B A7 B4 00 00 00',                '41 BC 20 00 00 00 90',                'flying bound 7' },
    { 0xA093,  '3B 9F B4 00 00 00',                   '81 FB 20 00 00 00',                   'flying bound 8' },
    { 0xA1BE,  '3B 9F B4 00 00 00',                   '81 FB 20 00 00 00',                   'flying bound 9' },

    { 0xBFB7,  'BF 20 00 00 00',                      'BF %s',                               'score falloff (alive)' },
    { 0xC019,  'BF 20 00 00 00',                      'BF %s',                               'score falloff (downed)' },

    { -0xDE6F, 'C7 87 B4 00 00 00 20 00 00 00',       'C7 87 B4 00 00 00 %s',                'MaxAttackers default' },
}

return {
    aggro_cap = {
        pattern = PATTERN,
        match = function(ctx)
            local cap = MAX_ATTACKERS
            if cap < 32 then cap = 32 elseif cap > 128 then cap = 128 end

            local anchor = ctx:address()
            local plan = {}

            if ctx[anchor + 3] == 0x41 and ctx[anchor + 4] == 0x83 then
                print('aggro_cap: already applied, nothing to do')
                return
            end

            for _, site in ipairs(SITES) do
                local addr, old, hex, what = anchor + site[1], bytes(site[2]), site[3], site[4]

                if hex:find('%%s') then -- little-endian imm32 from MAX_ATTACKERS
                    hex = hex:format(('%02X %02X %02X %02X'):format(
                        cap % 256, math.floor(cap / 256) % 256,
                        math.floor(cap / 65536) % 256, math.floor(cap / 16777216) % 256))
                end
                local new = bytes(hex)

                for i = 1, #old do
                    if ctx[addr + i - 1] ~= old[i] then
                        print(('aggro_cap: %s at %X unrecognised (byte %d), NOTHING written')
                            :format(what, addr, i))
                        return
                    end
                end
                plan[#plan + 1] = { addr = addr, new = new }
            end

            for _, w in ipairs(plan) do
                for i = 1, #w.new do ctx[w.addr + i - 1] = w.new[i] end
            end

            print(
                ('aggro_cap: MaxAttackers 32 -> %d, target-score falloff raised to match, ' ..
                    'ground ring index wrapped to 32, flying bounds pinned to 32 ' ..
                    '(%d sites patched)'):format(cap, #plan)
            )
        end
    }
}
