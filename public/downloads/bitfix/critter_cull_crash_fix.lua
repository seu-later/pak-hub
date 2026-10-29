-- bitfix/critter_cull_crash_fix.lua

local PATTERN =
    'F3 44 0F 10 16 F3 44 0F 10 5E 04 ' ..
    'F3 44 0F 10 66 08 F3 44 0F 10 46 0C ' ..
    '0F 1F 40 00 66 0F 1F 84 00 00 00 00 00 ' ..
    '48 8B EB 0F 28 FE 48 8B 1F ' .. 
    '48 8B 83 30 01 00 00 48 85 C0 74 2B'

local HEAD_OFF, BRANCH_OFF = 0x17, 0xE9

local HEAD = {
    0x48, 0x8B, 0xEB,               
    0x0F, 0x28, 0xFE,              
    0x48, 0x8B, 0x1F,              
    0x48, 0x85, 0xDB,               
    0x75, 0x08,                     
    0x48, 0x8B, 0xDD,              
    0xE9, 0xB5, 0x00, 0x00, 0x00, 
}

local BRANCH_OLD = { 0x0F, 0x85, 0x35, 0xFF, 0xFF, 0xFF }  
local BRANCH_REL = { 0x28, 0xFF, 0xFF, 0xFF }             

return {
    critter_cull_null_entry = {
        pattern = PATTERN,
        match = function(ctx)
            local base, branch = ctx:address(), ctx:address() + BRANCH_OFF

            for i = 1, #BRANCH_OLD do
                if ctx[branch + i - 1] ~= BRANCH_OLD[i] then
                    print(('critter_cull_crash_fix: loop branch at %X unrecognised, skipped')
                        :format(branch))
                    return
                end
            end

            for i = 1, #HEAD do ctx[base + HEAD_OFF + i - 1] = HEAD[i] end
            for i = 1, #BRANCH_REL do ctx[branch + 2 + i - 1] = BRANCH_REL[i] end

            print(('critter_cull_crash_fix: patched loop head at %X'):format(base + HEAD_OFF))
        end
    }
}
