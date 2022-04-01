extends Node2D

onready var timer = get_node("Slowfruit_Transition_Timer")
onready var timer_counter = get_node("Timer")
onready var time_label = get_node("Time_Till_Queue")

var time_left = 5

func _ready():
	timer.set_wait_time(5)
	timer_counter.set_wait_time(1)
	time_label.text = "5"
	timer_counter.start()
	timer.start()


func _on_Slowfruit_Transition_Timer_timeout():
	get_tree().change_scene("res://SlowFruit/Fruit_Level.tscn")


func _on_Timer_timeout():
	time_left -= 1
	time_label.text=str(time_left)
