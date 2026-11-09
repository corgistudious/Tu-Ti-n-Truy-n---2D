extends Node
## Dữ liệu game tải từ server (/api/data/bundle) — nguồn duy nhất, client không tự định nghĩa lại.

var data = {}
var version = ""
var items = {}
var skills = {}
var monsters = {}
var maps = {}
var npcs = {}
var quests = {}
var recipes = {}
var shops = {}
var pets = {}
var dungeons = {}
var realms = []
var buildings = {}
var sets = {}
var physics = {"gravity": 1500.0, "runSpeed": 210.0, "jumpVelocity": 560.0, "maxFall": 900.0, "dodgeSpeed": 520.0, "dodgeTime": 0.22, "playerW": 26.0, "playerH": 58.0}
const RARITY_NAMES := ["Phàm Phẩm", "Tinh Phẩm", "Hiếm", "Huyền Phẩm", "Địa Phẩm", "Thiên Phẩm", "Linh Phẩm", "Tiên Phẩm", "Thần Phẩm", "Hỗn Độn Phẩm"]
const RARITY_COLORS := ["#c8c8c8", "#7ee07e", "#5aa9ff", "#b06cff", "#d9a441", "#ff8a3d", "#3de0d0", "#ff5fa2", "#ff3b3b", "#ffffff"]
const SLOTS := ["weapon", "armor", "helmet", "boots", "ring", "amulet", "artifact", "fashion", "mount"]
const SLOT_NAMES := {"weapon": "Vũ khí", "armor": "Giáp", "helmet": "Mũ", "boots": "Giày", "ring": "Nhẫn", "amulet": "Dây chuyền", "artifact": "Pháp bảo", "fashion": "Thời trang", "mount": "Thú cưỡi"}
const PATH_NAMES := {"kiem": "Kiếm Tu", "dao": "Đao Tu", "quyen": "Quyền Tu", "the": "Thể Tu", "phap": "Pháp Tu", "loi": "Lôi Tu", "hoa": "Hỏa Tu", "bang": "Băng Tu", "doc": "Độc Tu", "phu": "Phù Tu", "tran": "Trận Pháp", "ngu_thu": "Ngự Thú", "co_ban": "Cơ Bản"}
const PROF_NAMES := {"alchemy": "Luyện Đan", "forging": "Luyện Khí", "talisman": "Chế Phù", "formation": "Trận Pháp", "mining": "Khai Khoáng", "herbalism": "Hái Thuốc", "fishing": "Câu Cá", "farming": "Trồng Linh Thảo", "tailoring": "Chế Tạo Trang Bị"}

func load_bundle() -> bool:
	var vr = await Net.http("GET", "/api/data/version")
	if vr.status != 200:
		return false
	var v: String = vr.data.version
	var f = FileAccess.open("user://bundle.json", FileAccess.READ)
	if f:
		var cached = JSON.parse_string(f.get_as_text())
		f.close()
		if cached is Dictionary and cached.get("version", "") == v:
			_apply(cached)
			return true
	var r = await Net.http("GET", "/api/data/bundle")
	if r.status != 200 or not (r.data is Dictionary):
		return false
	var w = FileAccess.open("user://bundle.json", FileAccess.WRITE)
	if w:
		w.store_string(JSON.stringify(r.data))
		w.close()
	_apply(r.data)
	return true

func _apply(d: Dictionary) -> void:
	data = d
	version = d.version
	items = d.items
	skills = d.skills
	monsters = d.monsters
	maps = d.maps
	npcs = d.npcs
	quests = d.quests
	recipes = d.recipes
	shops = d.shops
	pets = d.pets
	dungeons = d.dungeons
	realms = d.realms
	buildings = d.buildings
	sets = d.sets

func item_name(id: String) -> String:
	return items[id].name if items.has(id) else id

func rarity_color(r: int) -> Color:
	return Color(RARITY_COLORS[clampi(r, 0, 9)])

func realm_name(idx: int) -> String:
	if idx < realms.size():
		return realms[idx].name
	return "Hỗn Độn Cảnh — Trọng %d" % (idx - realms.size() + 1)

static func fmt(n) -> String:
	var v = float(n)
	if abs(v) >= 1e12: return "%.2f vạn ức" % (v / 1e12)
	if abs(v) >= 1e8: return "%.2f ức" % (v / 1e8)
	if abs(v) >= 1e4: return "%.1f vạn" % (v / 1e4)
	return str(int(v))
