extends Node2D


export var found_floor = false
var yelp_sound_has_played = false;


# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.


func _on_FloorArea2D_body_entered(body):
	found_floor = true	
	
func _on_YelpSound_finished():
	if !yelp_sound_has_played:
		yelp_sound_has_played = true
		$YelpSound.stop()

func get_found_floor():
	return found_floor
	
func set_found_floor(param1):
	found_floor = param1

func _on_Timer_timeout():
	$YelpSound.play() 


func _on_FloorArea2D_body_exited(body):
	found_floor = false


func _on_Area2D_body_entered_platform(body):
	found_floor = true


func _on_Area2D_body_exited_platform(body):
	found_floor = false



func _on_SmallPlatformArea2D_body_entered(body):
	found_floor = true

	
func _on_SmallPlatformArea2D_body_exited(body):
	found_floor = false

	
func _on_Floor2Area2D_body_entered(body):
	found_floor = true


func _on_Floor2Area2D_body_exited(body):
	found_floor = false
