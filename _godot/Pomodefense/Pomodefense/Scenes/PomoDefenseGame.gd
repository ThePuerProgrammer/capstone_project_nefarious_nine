extends Node2D

signal game_finished(result)

## global variables
var map_node
var build_mode = false
var build_valid = false
var build_location
var build_type
var build_tile
var current_wave = 0
var enemies_in_wave = 0
var base_health = 100
var wave_data = []

func _ready():
	map_node = get_node("Map1") ## can be updated with additional maps IF THERE WAS TIME c:
	
	for i in get_tree().get_nodes_in_group("build_buttons"):
		## get name of button and pass it to build mode
		i.connect("pressed", self, "initiate_build_mode", [i.get_name()])
	
func _process(delta):
	if build_mode:
		update_tower_preview()
	
func _unhandled_input(event):
	## right click cancels build mode, left click builds a tower
	if event.is_action_released("ui_cancel") and build_mode == true:
		cancel_build_mode()
	if event.is_action_released("ui_accept") and build_mode == true:
		verify_and_build()
		cancel_build_mode()

## wave functions

func start_next_wave():
	wave_data.clear()
	wave_data = retrieve_wave_data()
	yield(get_tree().create_timer(0.2), "timeout")
	spawn_enemies(wave_data)

func retrieve_wave_data():
	current_wave += 1
	print(current_wave)
	if current_wave <= 5:
		wave_data = [["Fish", 1.0, "HighPath"], ["Fish", 1.0, "HighPath"], ["Fish", 1.0, "HighPath"]]
	elif current_wave >= 5 and current_wave <= 10:
		wave_data = [["Fish", 1.0, "Path"], ["Fish", 1.0, "Path"], ["Fish", 1.0, "HighPath"], ["Carrot", 1.25, "Path"], ["Carrot", 1.25, "Path"]]
	else:
		randomize()
		var path
		var path_choice = randi() % 4 + 1
		if path_choice == 1:
			path = "HighPath"
		elif path_choice == 2:
			path = "LowPath"
		else:
			path = "Path"
		var fish_wave = current_wave % 3 + 2
		var carrot_wave = current_wave % 3 + 1
		var bone_wave = current_wave % 3
		for i in range(fish_wave):
			wave_data.append(["Fish", 1.0, path])
		for i in range(carrot_wave):
			wave_data.append(["Carrot", 1.25, path])
		for i in range(bone_wave):
			wave_data.append(["Bone", 1.5, path])
	enemies_in_wave = wave_data.size()
	return wave_data
	
func spawn_enemies(wave_data):
	for i in wave_data:
		var new_enemy = load("res://Scenes/" + i[0] + ".tscn").instance()
		new_enemy.creep_type = i[0]
		new_enemy.connect("base_damage", self, 'on_base_damage')
		map_node.get_node(i[2]).add_child(new_enemy, true)
		yield(get_tree().create_timer(i[1]), "timeout")
		
## building functions
	
func initiate_build_mode(tower_type):
	if build_mode:
		cancel_build_mode()
	build_type = tower_type ## what type tower we build
	build_mode = true
	get_node("UI").set_tower_preview(build_type, get_global_mouse_position()) ## build it baybeeeee

func update_tower_preview():
	var mouse_position = get_global_mouse_position()
	var current_tile = map_node.get_node("TowerExclusion").world_to_map(mouse_position)
	var tile_position = map_node.get_node("TowerExclusion").map_to_world(current_tile)
	
	## check whether build location is valid or not
	if map_node.get_node("TowerExclusion").get_cellv(current_tile) == -1:
		get_node("UI").update_tower_preview(tile_position, "ad54ff3c")
		build_valid = true
		build_location = tile_position
		build_tile = current_tile
	else:
		get_node("UI").update_tower_preview(tile_position, "adff4545")
		build_valid = false

func cancel_build_mode():
	build_mode = false
	build_valid = false
	get_node("UI/TowerPreview").free()
	
func verify_and_build():
	if build_valid:
		var new_tower = load("res://Scenes/" + build_type + ".tscn").instance()
		new_tower.position = build_location
		new_tower.built = true
		new_tower.type = build_type
		map_node.get_node("Turrets").add_child(new_tower, true)
		map_node.get_node("TowerExclusion").set_cellv(build_tile, 3)
		
func on_base_damage(damage):
	base_health -= damage
	print(base_health)
	print(base_health)
	if base_health <= 0:
		emit_signal("game_finished", false)
	else:
		get_node("UI").update_health_bar(base_health)
		enemies_in_wave -= 1
		print(enemies_in_wave)
		if enemies_in_wave == 0:
			wave_data.clear()
			start_next_wave()
