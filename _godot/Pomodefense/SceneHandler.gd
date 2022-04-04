extends Node

func _ready():
	var game_scene = get_node("PomoDefenseGame")
	game_scene.connect("game_finished", self, 'unload_game')
	
func unload_game(result):
	get_node("PomoDefenseGame").queue_free()
	var game_over = load("res://Scenes/GameOver.tscn").instance()
	add_child(game_over)
