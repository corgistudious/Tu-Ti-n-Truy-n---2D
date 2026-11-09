extends Node
## Tải và cache texture/âm thanh. Tài nguyên có thể được thay bằng asset ChatGPT đã duyệt mà không đổi mã.

var _tex = {}
var item_index = {}
var skill_index = {}
var bgm_map = {}

func _ready() -> void:
	item_index = _json("res://assets/icons/items.json")
	skill_index = _json("res://assets/icons/skills.json")
	bgm_map = _json("res://assets/audio/bgm_map.json")

func _json(p: String) -> Dictionary:
	var f = FileAccess.open(p, FileAccess.READ)
	if f == null:
		return {}
	var d = JSON.parse_string(f.get_as_text())
	return d if d is Dictionary else {}

func tex(path: String) -> Texture2D:
	if _tex.has(path):
		return _tex[path]
	var t: Texture2D = null
	if ResourceLoader.exists(path):
		t = load(path)
	_tex[path] = t
	return t

func item_icon(item_id: String) -> Texture2D:
	var def = GameData.items.get(item_id)
	var key: String = def.icon if def else "icon_material"
	var cache_key = "icon:" + key
	if _tex.has(cache_key):
		return _tex[cache_key]
	var atlas = tex("res://assets/icons/items.png")
	var at = AtlasTexture.new()
	at.atlas = atlas
	var idx = int(item_index.get(key, 0))
	at.region = Rect2((idx % 16) * 32, (idx / 16) * 32, 32, 32)
	_tex[cache_key] = at
	return at

func skill_icon(skill_id: String) -> Texture2D:
	var cache_key = "skill:" + skill_id
	if _tex.has(cache_key):
		return _tex[cache_key]
	var at = AtlasTexture.new()
	at.atlas = tex("res://assets/icons/skills.png")
	var idx = int(skill_index.get(skill_id, 0))
	at.region = Rect2((idx % 8) * 64, (idx / 8) * 64, 64, 64)
	_tex[cache_key] = at
	return at

func weapon_tex(look) -> Texture2D:
	if look == null or look == "":
		return null
	var s = str(look)
	# wpn_sword_0 / wpn_set_<setid> -> dùng bậc vũ khí phù hợp
	if s.begins_with("wpn_set_"):
		s = "wpn_sword_3"
	return tex("res://assets/weapons/%s.png" % s)
