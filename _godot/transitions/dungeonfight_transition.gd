extends Node2D

onready var timer = get_node("Dungeonfight_Transition_Timer")
onready var timer_counter = get_node("Timer")
onready var time_label = get_node("Time_Till_Queue")
onready var game_queue_test = Pomotimer._game_queue
onready var anim = get_node("Dungeonfight_Animator")

var time_left = 3

func _ready():
	anim.play("FADE_OUT")
	timer.set_wait_time(time_left)
	timer_counter.set_wait_time(1)
	time_label.text = str(time_left)
	timer_counter.start()
	timer.start()

func _on_Dungeonfight_Transition_Timer_timeout():
	anim.play("FADE_IN")
	get_tree().change_scene("res://dungeon_fight/dungeon_fight.tscn")
	

func _on_Timer_timeout():
	time_left -= 1
	time_label.text=str(time_left)


func _on_AnimationPlayer_animation_finished(anim_name):
	match anim_name:
		"FADE_OUT":
			anim.play("FADE_IN")
		"FADE_IN":
			anim.play("FADE_OUT")
