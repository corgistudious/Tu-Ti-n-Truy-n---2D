class_name TilePhysics
extends RefCounted
## Bản sao chính xác của shared/src/tilemap.ts (moveBody) — dự đoán phía client; server kiểm chứng.

const TILE := 32.0

static func tile_at(rows: Array, w: int, h: int, tx: int, ty: int) -> String:
	if tx < 0 or tx >= w or ty >= h:
		return "#"
	if ty < 0:
		return "."
	return rows[ty][tx]

static func solid(rows: Array, w: int, h: int, tx: int, ty: int) -> bool:
	return tile_at(rows, w, h, tx, ty) == "#"

static func move_body(rows: Array, b: Dictionary, dt: float, gravity: float, max_fall: float, drop_through := false) -> void:
	var w: int = rows[0].length()
	var h: int = rows.size()
	b.vy = min(max_fall, b.vy + gravity * dt)
	var max_step = TILE / 2.0 - 1.0
	var steps = maxi(1, int(ceil(max(abs(b.vx), abs(b.vy)) * dt / max_step)))
	var sdt = dt / steps
	var grounded = false
	for i in steps:
		_step(rows, w, h, b, sdt, drop_through)
		if b.on_ground:
			grounded = true
	b.on_ground = grounded and b.vy >= 0

static func _step(rows: Array, w: int, h: int, b: Dictionary, dt: float, drop_through: bool) -> void:
	var half: float = b.w / 2.0
	var nx: float = b.x + b.vx * dt
	var top: float = b.y - b.h + 1
	var bottom: float = b.y - 1
	var ty0 = int(floor(top / TILE))
	var ty1 = int(floor(bottom / TILE))
	if b.vx > 0:
		var tx = int(floor((nx + half) / TILE))
		for ty in range(ty0, ty1 + 1):
			if solid(rows, w, h, tx, ty):
				nx = tx * TILE - half - 0.01
				b.vx = 0.0
				break
	elif b.vx < 0:
		var tx = int(floor((nx - half) / TILE))
		for ty in range(ty0, ty1 + 1):
			if solid(rows, w, h, tx, ty):
				nx = (tx + 1) * TILE + half + 0.01
				b.vx = 0.0
				break
	b.x = nx
	var ny: float = b.y + b.vy * dt
	var tx0 = int(floor((b.x - half + 1) / TILE))
	var tx1 = int(floor((b.x + half - 1) / TILE))
	b.on_ground = false
	if b.vy > 0:
		var prev_ty = int(floor((b.y - 0.01) / TILE))
		var ty = int(floor(ny / TILE))
		for row in range(prev_ty + 1, ty + 1):
			var hit = false
			for tx in range(tx0, tx1 + 1):
				var t = tile_at(rows, w, h, tx, row)
				if t == "#" or (t == "=" and not drop_through):
					hit = true
					break
			if hit:
				ny = row * TILE
				b.vy = 0.0
				b.on_ground = true
				break
	elif b.vy < 0:
		var ty = int(floor((ny - b.h) / TILE))
		for tx in range(tx0, tx1 + 1):
			if solid(rows, w, h, tx, ty):
				ny = (ty + 1) * TILE + b.h
				b.vy = 0.0
				break
	b.y = ny
	if not b.on_ground and b.vy == 0.0:
		var row = int(floor(b.y / TILE))
		for tx in range(tx0, tx1 + 1):
			var t = tile_at(rows, w, h, tx, row)
			if (t == "#" or t == "=") and abs(b.y - row * TILE) < 0.5:
				b.on_ground = true
