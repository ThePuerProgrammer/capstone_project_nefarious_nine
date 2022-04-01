extends Node2D

onready var timer = get_node("Dungeonfight_Transition_Timer")
onready var timer_counter = get_node("Timer")
onready var time_label = get_node("Time_Till_Queue")
onready var game_queue_test = Pomotimer._game_queue

var time_left = 5

func _ready():
	timer.set_wait_time(5)
	timer_counter.set_wait_time(1)
	time_label.text = "5"
	timer_counter.start()
	timer.start()
	print("=======================================")
	print("Transition Game Queue:",game_queue_test)

func _on_Dungeonfight_Transition_Timer_timeout():
	get_tree().change_scene("res://dungeon_fight/dungeon_fight.tscn")
	

func _on_Timer_timeout():
	time_left -= 1
	time_label.text=str(time_left)
