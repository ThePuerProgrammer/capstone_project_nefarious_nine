extends Node2D

onready var timer = get_node("Pomobite_Transition_Timer")
onready var timer_counter = get_node("Timer")
onready var time_label = get_node("Time_Till_Queue")
onready var anim = get_node("Pomobite_Animator")

var time_left = 3

func _ready():
	anim.play("FADE_OUT")
	timer.set_wait_time(time_left)
	timer_counter.set_wait_time(1)
	time_label.text = str(time_left)
	timer_counter.start()
	timer.start()

#This is the game it will be transitioning to
func _on_Pomobite_Transition_Timer_timeout():
	anim.play("FADE_IN")
	get_tree().change_scene("res://pomobite/Restaurant_Level.tscn")

#This is a timer that is providing a countdown to be displayed
func _on_Timer_timeout():
	time_left -= 1
	time_label.text=str(time_left)


func _on_Pomobite_Animator_animation_finished(anim_name):
	match anim_name:
		"FADE_OUT":
			anim.play("FADE_IN")
		"FADE_IN":
			anim.play("FADE_OUT")
