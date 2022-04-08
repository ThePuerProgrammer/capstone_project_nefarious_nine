extends Node2D

var enemy_array = []
var built = false
var enemy
var type
var ready = true
var tower_data = {
	"PomopetT1": {
		"damage": 20,
		"rate": 1,
		"range": 350,
		"cost": 25,
	},
	"PomopetT2": {
		"damage": 50,
		"rate": 1.5,
		"range": 400,
		"cost": 30,
	},
	"PomopetT3": {
		"damage": 100,
		"rate": 2,
		"range": 500,
		"cost": 40,
	}
}

func _ready():
	if built:
		self.get_node("Range/CollisionShape2D").get_shape().radius = 0.5 * tower_data[type]["range"]

func _physics_process(delta):
	if enemy_array.size() != 0 and built:
		select_enemy()
		if not get_node("AnimationPlayer").is_playing():
			turn()
		if ready:
			fire()
	else:
		enemy = null
	
func turn():
	get_node("cannon").look_at(enemy.position)
	
func select_enemy():
	var enemy_progress_array = []
	for i in enemy_array:
		enemy_progress_array.append(i.offset)
	var max_offset = enemy_progress_array.max()
	var enemy_index = enemy_progress_array.find(max_offset)
	enemy = enemy_array[enemy_index]

func fire():
	ready = false
	get_node("AnimationPlayer").play("Fire")
	enemy.on_hit(tower_data[type]["damage"])
	yield(get_tree().create_timer(tower_data[type]["rate"]), "timeout")
	ready = true

func _on_Range_body_entered(body):
	enemy_array.append(body.get_parent())

func _on_Range_body_exited(body):
	enemy_array.erase(body.get_parent())
