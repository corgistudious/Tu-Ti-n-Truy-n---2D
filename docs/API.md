# API

Tất cả JSON. Lỗi: `{ "error": "thông báo tiếng Việt" }` với mã HTTP 4xx/5xx. Xác thực: `Authorization: Bearer <token>`.

## HTTP — tài khoản (`/api/auth`)

| Phương thức | Đường dẫn | Mô tả |
|---|---|---|
| POST | `/register` `{email,password,device?}` | Tạo tài khoản, gửi email xác thực. Trả `{token}` (hoặc `needVerify` nếu REQUIRE_EMAIL_VERIFIED) |
| GET/POST | `/verify?token=` / `{token}` | Xác thực email |
| POST | `/resend-verification` | Gửi lại email xác thực |
| POST | `/login` `{email,password,device?}` | `{token, account}`; 401 sai, 423 tạm khóa, 403 bị cấm |
| GET | `/me` | Thông tin tài khoản |
| POST | `/logout` | Thu hồi phiên hiện tại |
| GET | `/sessions` | Danh sách phiên (thiết bị) |
| DELETE | `/sessions/:id` | Đăng xuất một thiết bị |
| POST | `/logout-all` | Đăng xuất mọi thiết bị khác |
| POST | `/forgot` `{email}` | Gửi mã đặt lại (luôn trả ok) |
| POST | `/reset` `{token,password}` | Đặt lại mật khẩu, thu hồi mọi phiên |
| POST | `/change-password` `{oldPassword,newPassword}` | Đổi mật khẩu |

## HTTP — nhân vật & dữ liệu

| | | |
|---|---|---|
| GET | `/api/characters` | Danh sách nhân vật |
| POST | `/api/characters` `{name, appearance}` | Tạo (appearance: gender, hair, hairColor, face, eyes, skin, outfit, outfitColor — giá trị hợp lệ ở `/api/data/appearance-options`) |
| POST | `/api/characters/:id/delete` `{confirmName}` | Yêu cầu xóa (bảo vệ 24 giờ) |
| POST | `/api/characters/:id/restore` | Hủy yêu cầu xóa |
| GET | `/api/data/version`, `/api/data/bundle` | Phiên bản & toàn bộ dữ liệu game (ETag) |
| GET | `/healthz`, `/readyz`, `/metrics` | Giám sát |

## HTTP — quản trị (`/api/admin`, vai trò support/gm/admin)

`me, overview, online, accounts(?q), accounts/:id, accounts/:id/{ban,unban,mute,unmute,role}, characters/:id, characters/:id/{grant,currency,kick},
economy, trades, ledger, item-logs, chat, content, content/override, boss/spawn, events (GET/POST), events/:id/cancel, announce, reports,
reports/:id/resolve, errors, logs, staff, mail-outbox, assets/generate (API Mode)`. Mọi thao tác ghi `admin_logs`.

## WebSocket `/ws`

1. Client gửi `{"t":"auth","token":"...","characterId":123}` trong 10 giây.
2. Server gửi `hello`, sau đó `map` (bản đồ, kênh, lưới va chạm `grid`, trạng thái bản thân `self`).

### Client → Server

| t | Trường | Ý nghĩa |
|---|---|---|
| `input` | `seq,x,y,vx,vy,f,g,a` | Vị trí dự đoán 15 Hz; server kiểm tra tốc độ/va chạm/thời gian trên không, sai → `corr` |
| `atk` | `seq` | Đánh thường (combo 3 đòn) |
| `skill` | `seq,s,tx?` | Thi triển kỹ năng trên thanh kỹ năng |
| `dodge` | `seq` | Né (bất tử ngắn) |
| `rpc` | `id,m,p` | Gọi phương thức; trả `{"t":"res","id","ok","d"|"e"}` |
| `ping` | `c` | Đo độ trễ |

### Server → Client

- `snap` `{tick, e:[NetEntity], gone:[id], me?}` — 10 Hz, chỉ thực thể trong vùng quan tâm, chỉ trường thay đổi.
- `corr` `{x,y}` — sửa vị trí. `kick` `{reason}`. `chat` `{ch,from,text}`.
- `ev` với `k`: `dmg, heal, fx, tele, boom, zone, wind, die, revive, st, combo, say, lvl, tuvi, self, cur, inv, quest, questAccepted, skills,
  msg, chan, chanx, med, dead, kb, pick, node, party, partyReq, friendReq, guildReq, duelReq, tradeReq, trade, tradeEnd, duel, guild, mail,
  friend, arena, arenaEnd, dungeonEnd, trial, breakthrough, house`.

### Danh sách RPC

`npc.talk, npc.service, quest.{accept,turnIn,abandon,list}, interact.use, portal.use, teleport.npc, respawn, chat.send, char.info,
settings.keybinds, title.set, pvp.mode, report.player, rank.get, shop.{list,buy,sell},
inv.{list,pickup,use,equip,unequip,move,sort,lock,destroy,toStorage,fromStorage}, equip.{enhance,refine,socket,gem,reroll,repair},
skill.{list,learnUpgrade,hotbar}, cult.{info,meditate,breakthrough}, craft.{list,start,claim}, gather.start,
mail.{list,claim,delete}, trade.{request,respond,offer,lock,confirm,cancel}, market.{list,search,mine,buy,cancel}, auction.{create,search,mine,bid},
party.{invite,respond,leave,kick}, friend.{list,add,respond,remove,block},
guild.{create,info,list,invite,respond,leave,kick,setRank,notice,donate,deposit,withdraw,war,boss},
pet.{list,summon,dismiss,feed,evolve,rename,release,equip}, house.{claim,info,enter,leave,upgrade,build,plant,harvest,place,remove,access},
duel.{request,respond}, arena.{queue,leave}, dungeon.{enter,leave}`.
Định nghĩa: `server/src/game/rpc/*.ts`.
