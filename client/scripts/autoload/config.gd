extends Node
## Cấu hình client: địa chỉ server, phím tắt, âm lượng. Lưu tại user://settings.cfg

const DEFAULT_SERVER := "http://127.0.0.1:8080"
var server_url = DEFAULT_SERVER
var music_volume = 0.6
var sfx_volume = 0.8
var keybinds = {}
var autotest = false
var cfg = ConfigFile.new()

const DEFAULT_KEYS := {
	"move_left": ["A", "Left"], "move_right": ["D", "Right"], "jump": ["Space", "W", "Up"], "down": ["S", "Down"],
	"attack": ["J"], "skill_1": ["K"], "skill_2": ["L"], "skill_3": ["U"], "skill_4": ["I"], "skill_5": ["O"],
	"dodge": ["Shift"], "interact": ["E"], "pickup": ["F"], "inventory": ["B"], "character": ["C"], "map": ["M"],
	"chat": ["Enter"], "quests": ["Q"], "skills": ["N"], "cultivate": ["R"], "close": ["Escape"],
}
const ACTION_NAMES := {
	"move_left": "Sang trái", "move_right": "Sang phải", "jump": "Nhảy", "down": "Xuống bục", "attack": "Đánh thường",
	"skill_1": "Kỹ năng 1", "skill_2": "Kỹ năng 2", "skill_3": "Kỹ năng 3", "skill_4": "Kỹ năng 4", "skill_5": "Kỹ năng 5",
	"dodge": "Né tránh", "interact": "Tương tác", "pickup": "Nhặt đồ", "inventory": "Túi đồ", "character": "Nhân vật",
	"map": "Bản đồ", "chat": "Chat", "quests": "Nhiệm vụ", "skills": "Kỹ năng", "cultivate": "Đả tọa", "close": "Đóng cửa sổ",
}

func _ready() -> void:
	cfg.load("user://settings.cfg")
	server_url = cfg.get_value("net", "server", DEFAULT_SERVER)
	music_volume = cfg.get_value("audio", "music", 0.6)
	sfx_volume = cfg.get_value("audio", "sfx", 0.8)
	keybinds = cfg.get_value("input", "keys", DEFAULT_KEYS.duplicate(true))
	for k in DEFAULT_KEYS:
		if not keybinds.has(k):
			keybinds[k] = DEFAULT_KEYS[k]
	# Web: dùng cùng origin với trang (server phục vụ client tại /play/)
	if OS.has_feature("web"):
		var origin = JavaScriptBridge.eval("window.location.origin", true)
		if typeof(origin) == TYPE_STRING and origin.begins_with("http"):
			server_url = origin
		var search = JavaScriptBridge.eval("window.location.search", true)
		if typeof(search) == TYPE_STRING and "autotest" in search:
			autotest = true
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--server="):
			server_url = a.substr(9)
		if a == "--autotest":
			autotest = true
	apply_keybinds()

func ws_url() -> String:
	return server_url.replace("https://", "wss://").replace("http://", "ws://") + "/ws"

func save() -> void:
	cfg.set_value("net", "server", server_url)
	cfg.set_value("audio", "music", music_volume)
	cfg.set_value("audio", "sfx", sfx_volume)
	cfg.set_value("input", "keys", keybinds)
	cfg.save("user://settings.cfg")

func apply_keybinds() -> void:
	for action in keybinds:
		if InputMap.has_action(action):
			InputMap.action_erase_events(action)
		else:
			InputMap.add_action(action)
		for key_name in keybinds[action]:
			var code = OS.find_keycode_from_string(key_name)
			if code != KEY_NONE:
				var ev = InputEventKey.new()
				ev.physical_keycode = code
				InputMap.action_add_event(action, ev)

func set_key(action: String, key_name: String) -> void:
	keybinds[action] = [key_name]
	apply_keybinds()
	save()
