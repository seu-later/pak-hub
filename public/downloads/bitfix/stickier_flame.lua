local function patch_actor_gate(ctx)
    local a = ctx:address()
    local gate = nil

    -- Find the conditional jump immediately after the FHitResult class test.
    -- The surrounding instruction pattern is part of the signature, so this
    -- does not depend on a fixed function offset after a game update.
    for i = 0, 0x90 do
        if ctx[a + i] == 0x48 and
            ctx[a + i + 1] == 0x39 and
            ctx[a + i + 2] == 0x1C and
            ctx[a + i + 3] == 0xC8 and
            ctx[a + i + 4] == 0x75 and
            ctx[a + i + 6] == 0xF2 and
            ctx[a + i + 7] == 0x0F and
            ctx[a + i + 8] == 0x10 and
            ctx[a + i + 9] == 0x47 and
            ctx[a + i + 10] == 0x30 then
            if gate ~= nil then
                print('stickier_flame: ambiguous actor gate; patch skipped')
                return
            end
            gate = a + i + 4
        end
    end

    if gate == nil or ctx[gate] ~= 0x75 then
        print('stickier_flame: actor gate not found; patch skipped')
        return
    end

    ctx[gate] = 0x90
    ctx[gate + 1] = 0x90
    print('stickier_flame: actor gate bypassed')
end

return {
    {
        pattern = '48 89 5C 24 08 48 89 6C 24 10 48 89 74 24 18 57 48 83 EC ?? 48 8B ?? 48 8B ?? 48 8D 4A 68 E8 ?? ?? ?? ?? 48 85 C0 ?? ?? E8 ?? ?? ?? ?? 48 8D 4F 68 48 8B D8 E8 ?? ?? ?? ?? 48 63 4B 38 48 83 C3 30 48 8B 40 10 3B 48 38 ?? ?? 48 8B 40 30 48 39 1C C8 75 ?? F2 0F 10 47 30',
        match = patch_actor_gate,
    },
}
