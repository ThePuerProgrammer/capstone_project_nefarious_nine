extends Node2D

onready var timer = get_node("Pomobite_Transition_Timer")
onready var timer_counter = get_node("Timer")
onready var time_label = get_node("Time_Till_Queue")

var time_left = 5

#Things called when node is ready
func _ready():
	timer.set_wait_time(5)
	timer_counter.set_wait_time(1)
	time_label.text = "5"
	timer_counter.start()
	timer.start()

#This is the game it will be transitioning to
func _on_Pomobite_Transition_Timer_timeout():
	get_tree().change_scene("res://pomobite/Restaurant_Level.tscn")

#This is a timer that is providing a countdown to be displayed
func _on_Timer_timeout():
	time_left -= 1
	time_label.text=str(time_left)
