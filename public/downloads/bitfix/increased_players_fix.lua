-- bitfix/increased_players_fix.lua
return {
  {
    pattern = '48 8b c4 48 89 48 08 55 57 48 8d a8 58 ff ff ff 48 81 ec 98 01 00 00 48 83 79 30 00 48 8b f9 0f 84',
    match = function(ctx)
      ctx[ctx:address()] = 0xC3
    end
  }
}