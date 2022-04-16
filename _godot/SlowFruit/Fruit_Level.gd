extends Node2D

var fruitSpawn = preload("res://SlowFruit/FruitSpawner.tscn")

var slowfruitCoins = 0

func _ready():
	pass
	

func _process(delta):
	pass

func _physics_process(delta):
	pass

func reloadFruits():
	self.get_child(4).queue_free()
	var fruitSpawn_instance = fruitSpawn.instance()
	self.add_child(fruitSpawn_instance)
