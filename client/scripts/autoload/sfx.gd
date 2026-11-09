extends Node
## Âm thanh: nhạc nền theo khu vực (lặp), hiệu ứng theo sự kiện.

var _bgm = AudioStreamPlayer.new()
var _pool: Array[AudioStreamPlayer] = []
var _current = ""
var _streams = {}

func _ready() -> void:
	add_child(_bgm)
	for i in 10:
		var p = AudioStreamPlayer.new()
		add_child(p)
		_pool.append(p)

func _stream(path: String) -> AudioStream:
	if _streams.has(path):
		return _streams[path]
	var s: AudioStream = load(path) if ResourceLoader.exists(path) else null
	_streams[path] = s
	return s

func play_bgm(bgm_id: String) -> void:
	var theme: String = Assets.bgm_map.get(bgm_id, "village")
	if theme == _current:
		return
	_current = theme
	var s = _stream("res://assets/audio/bgm_%s.wav" % theme)
	if s is AudioStreamWAV:
		s.loop_mode = AudioStreamWAV.LOOP_FORWARD
		s.loop_begin = 0
		s.loop_end = s.data.size() / 2
	_bgm.stream = s
	_bgm.volume_db = linear_to_db(max(0.001, Config.music_volume * 0.5))
	_bgm.play()

func play(name: String, vol := 1.0) -> void:
	var s = _stream("res://assets/audio/sfx_%s.wav" % name)
	if s == null:
		return
	for p in _pool:
		if not p.playing:
			p.stream = s
			p.volume_db = linear_to_db(max(0.001, Config.sfx_volume * vol))
			p.play()
			return

func refresh_volume() -> void:
	_bgm.volume_db = linear_to_db(max(0.001, Config.music_volume * 0.5))
