extends Node
## Mạng: HTTP (đăng nhập/nhân vật) + WebSocket (thời gian thực + RPC). Server là nguồn xác thực.

signal message(msg: Dictionary)
signal game_connected
signal game_disconnected(code: int, reason: String)

class PendingRpc extends RefCounted:
	signal done(result: Dictionary)

var token = ""
var account = {}
var character_id = 0
var ws = WebSocketPeer.new()
var _state = WebSocketPeer.STATE_CLOSED
var _rpc_id = 0
var _pending = {}
var _want_connected = false
var _kicked = false
var _reconnect_delay = 1.0
var _reconnect_timer = 0.0
var ping_ms = 0
var _ping_timer = 0.0

func _ready() -> void:
	ws.inbound_buffer_size = 1 << 20
	ws.outbound_buffer_size = 1 << 18

# ---------------- HTTP ----------------
func http(method: String, path: String, body = null) -> Dictionary:
	var req = HTTPRequest.new()
	req.timeout = 15
	add_child(req)
	var headers = PackedStringArray(["Content-Type: application/json"])
	if token != "":
		headers.append("Authorization: Bearer " + token)
	var m = HTTPClient.METHOD_GET
	match method:
		"POST": m = HTTPClient.METHOD_POST
		"DELETE": m = HTTPClient.METHOD_DELETE
	var payload = "" if body == null else JSON.stringify(body)
	var err = req.request(Config.server_url + path, headers, m, payload)
	if err != OK:
		req.queue_free()
		return {"status": 0, "data": {"error": "Không kết nối được máy chủ"}}
	var res: Array = await req.request_completed
	req.queue_free()
	var code: int = res[1]
	var text: String = (res[3] as PackedByteArray).get_string_from_utf8()
	var data = JSON.parse_string(text) if text != "" else {}
	if data == null:
		data = {"raw": text}
	if res[0] != HTTPRequest.RESULT_SUCCESS:
		return {"status": 0, "data": {"error": "Không kết nối được máy chủ"}}
	return {"status": code, "data": data}

static func err_text(r: Dictionary) -> String:
	if r.data is Dictionary and r.data.has("error"):
		return str(r.data.error)
	return "Lỗi (%d)" % r.status

# ---------------- WebSocket ----------------
func connect_game(char_id: int) -> void:
	character_id = char_id
	_want_connected = true
	_kicked = false
	_open()

func _open() -> void:
	ws = WebSocketPeer.new()
	ws.inbound_buffer_size = 1 << 20
	var err = ws.connect_to_url(Config.ws_url())
	if err != OK:
		push_warning("ws connect error %d" % err)
	_state = WebSocketPeer.STATE_CONNECTING

func disconnect_game() -> void:
	_want_connected = false
	ws.close(1000, "logout")

func _process(delta: float) -> void:
	ws.poll()
	var st = ws.get_ready_state()
	if st != _state:
		var prev = _state
		_state = st
		if st == WebSocketPeer.STATE_OPEN:
			send({"t": "auth", "token": token, "characterId": character_id})
			_reconnect_delay = 1.0
		elif st == WebSocketPeer.STATE_CLOSED and prev != WebSocketPeer.STATE_CLOSED:
			for id in _pending.keys():
				_pending[id].done.emit({"ok": false, "e": "Mất kết nối"})
			_pending.clear()
			emit_signal("game_disconnected", ws.get_close_code(), ws.get_close_reason())
			if _want_connected and not _kicked:
				_reconnect_timer = _reconnect_delay
				_reconnect_delay = min(_reconnect_delay * 2.0, 16.0)
	if st == WebSocketPeer.STATE_OPEN:
		while ws.get_available_packet_count() > 0:
			var txt = ws.get_packet().get_string_from_utf8()
			var m = JSON.parse_string(txt)
			if m is Dictionary:
				_on_msg(m)
		_ping_timer -= delta
		if _ping_timer <= 0:
			_ping_timer = 5.0
			send({"t": "ping", "c": Time.get_ticks_msec()})
	elif st == WebSocketPeer.STATE_CLOSED and _want_connected and not _kicked:
		_reconnect_timer -= delta
		if _reconnect_timer <= 0:
			_reconnect_timer = 999.0
			_open()

func _on_msg(m: Dictionary) -> void:
	match m.get("t", ""):
		"res":
			var id = int(m.id)
			if _pending.has(id):
				var p: PendingRpc = _pending[id]
				_pending.erase(id)
				p.done.emit(m)
			return
		"pong":
			ping_ms = Time.get_ticks_msec() - int(m.c)
			return
		"kick":
			_kicked = true
		"map":
			emit_signal("game_connected")
	emit_signal("message", m)

func send(d: Dictionary) -> void:
	if ws.get_ready_state() == WebSocketPeer.STATE_OPEN:
		ws.send_text(JSON.stringify(d))

## Gọi RPC: var r = await Net.rpc_call("inv.list", {}) -> {ok, d | e}
func rpc_call(method: String, params: Dictionary = {}) -> Dictionary:
	if ws.get_ready_state() != WebSocketPeer.STATE_OPEN:
		return {"ok": false, "e": "Chưa kết nối máy chủ"}
	_rpc_id += 1
	var id = _rpc_id
	var p = PendingRpc.new()
	_pending[id] = p
	send({"t": "rpc", "id": id, "m": method, "p": params})
	get_tree().create_timer(12.0).timeout.connect(func():
		if _pending.has(id):
			_pending.erase(id)
			p.done.emit({"ok": false, "e": "Hết thời gian chờ"}))
	var r: Dictionary = await p.done
	return r

func is_online() -> bool:
	return ws.get_ready_state() == WebSocketPeer.STATE_OPEN
