extends Path2D
var forward = true

var y_track = 0
var h_track = 0

var pause_movement = false

func _ready():
	pass

func _process(delta):
	if pause_movement:
		return
	var r = RandomNumberGenerator.new()
	r.randomize()
	var f = r.randf_range(0.0, 1.0)
	
	if f < 0.001:
		$PauseMovementTimer.start()
		pause_movement = true
		$PathFollow2D/Chef_NPC.pause_movement = true
		return
	
	if f < 0.0015:
		forward = not forward
	
	if forward:
		$PathFollow2D.offset += 50 * delta
	else:
		$PathFollow2D.offset -= 50 * delta


func _on_PauseMovementTimer_timeout():
	$PathFollow2D/Chef_NPC.pause_movement = false
	pause_movement = false
