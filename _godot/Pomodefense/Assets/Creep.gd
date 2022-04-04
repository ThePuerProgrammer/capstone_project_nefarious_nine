extends PathFollow2D

signal base_damage(damage)
signal enemy_destroyed()

var speed
var health
var base_damage
var creep_type
var GameData = "res://Pomodefense/Singleton/GameData.gd"

onready var hp_bar = get_node("HPBar")
onready var impact_area = get_node("Impact")
var projectile_impact = preload("res://Pomodefense/Scenes/TurretImpact.tscn")

func _ready():
	speed = GameData.creep_data[creep_type]["speed"]
	health = GameData.creep_data[creep_type]["health"]
	base_damage = GameData.creep_data[creep_type]["base_damage"]
	hp_bar.max_value = health
	hp_bar.value = health
	hp_bar.set_as_toplevel(true)

func _physics_process(delta):
	if unit_offset >= 0.98 and unit_offset <= 1.0:
		emit_signal("base_damage", base_damage)
		queue_free()
	move(delta)
	
func move(delta):
	set_offset(get_offset() + speed * delta)
	hp_bar.set_position(position - Vector2(30, 40))
	
func on_hit(damage):
	impact()
	health -= damage
	hp_bar.value = health
	if health <= 0:
		emit_signal("enemy_destroyed")
		on_destroy()
		
func impact():
	randomize()
	var x_pos = randi() % 31
	randomize()
	var y_pos = randi() % 31
	var impact_location = Vector2(x_pos, y_pos)
	var new_impact = projectile_impact.instance()
	new_impact.position = impact_location
	impact_area.add_child(new_impact)
	

func on_destroy():
	get_node("KinematicBody2D").queue_free()
	yield(get_tree().create_timer(0.2), "timeout")
	queue_free()
	
