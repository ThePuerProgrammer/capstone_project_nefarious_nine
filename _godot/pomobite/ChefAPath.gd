extends Path2D
var forward = true

var y_track = 0
var h_track = 0

func _ready():
	pass

func _process(delta):
	var r = RandomNumberGenerator.new()
	r.randomize()
	var f = r.randf_range(0.0, 1.0)
	if f < 0.0015:
		forward = not forward
	
	if forward:
		$PathFollow2D.offset += 50 * delta
	else:
		$PathFollow2D.offset -= 50 * delta
