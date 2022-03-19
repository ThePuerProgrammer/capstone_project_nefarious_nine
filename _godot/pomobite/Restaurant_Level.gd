extends Node2D

signal ready_to_be_seated(patrons)
signal seat_guests()
signal return_to_host_stand()

onready var pos_wall 					= $POSWall
onready var pos_zoom 					= $POSZoom
onready var pos_screen 					= $POSZoom/POSScreen
onready var customer_paths 				= $Paths/CustomerPaths
onready var customer_walkin_timer		= $CustomerWalkInTimer
onready var right_paths					= $Paths/FollowHostPaths/RightPaths
onready var left_paths					= $Paths/FollowHostPaths/LeftPaths
onready var opening_restaurant			= true
onready var walk_in						= false
onready var pos_right_usable 			= false
onready var pos_left_usable 			= false
onready var soda_machine_area_entered 	= false
onready var expo_area_entered 			= false
onready var trash_area_entered 			= false
onready var dish_area_entered 			= false
onready var host_to_table				= false
onready var host_back_to_host_stand		= false
onready var left_player_section			= false
onready var customer_to_host_path		= false
onready var customer_path_h_offset		= 200

var pos_table_menu 		= preload("res://assets/textures/PomoBITE_Textures/Table_Menu.png")
var pos_default_screen 	= preload("res://assets/textures/PomoBITE_Textures/Inner_Monitor_Tables.png")
var customer_npc		= preload("res://pomobite/Customer_NPC.tscn")
var host_npc			= preload("res://pomobite/Host_NPC.tscn")
var convo_dialogue		= preload("res://pomobite/ConversationDialogue.tscn")
var selected_table 		= 1
var show_hint 			= true
var ticks				
var conversation_index
var controlled_player
var host_path
var offset_queue
var current_focused_table
var dialogue_queue

var convo_string

var tables = {
	tables_entered = [
		false, false, false, false, false, false,
		false, false, false, false, false, false
	],
	tables_sat = [
		false, false, false, false, false, false,
		false, false, false, false, false, false
	],
	seat_positions = {
		table1 =  [Vector2(76,   248), Vector2(76,   312), Vector2(212,  248), Vector2(212,  312)],
		table2 =  [Vector2(300,  248), Vector2(300,  312), Vector2(436,  248), Vector2(436,  312)],
		table3 =  [Vector2(76,   440), Vector2(76,   504), Vector2(212,  440), Vector2(212,  504)],
		table4 =  [Vector2(300,  440), Vector2(300,  504), Vector2(436,  440), Vector2(436,  504)],
		table5 =  [Vector2(96,   624), Vector2(192,  624), Vector2(96,   728), Vector2(192,  728)],
		table6 =  [Vector2(320,  624), Vector2(416,  624), Vector2(320,  728), Vector2(416,  728)],
		table7 =  [Vector2(1484, 248), Vector2(1484, 312), Vector2(1620, 248), Vector2(1620, 312)],
		table8 =  [Vector2(1708, 248), Vector2(1708, 312), Vector2(1848, 248), Vector2(1848, 312)],
		table9 =  [Vector2(1484, 440), Vector2(1484, 504), Vector2(1620, 440), Vector2(1620, 504)],
		table10 = [Vector2(1708, 440), Vector2(1708, 504), Vector2(1848, 440), Vector2(1848, 504)],
		table11 = [Vector2(1504, 624), Vector2(1600, 624), Vector2(1504, 728), Vector2(1600, 728)],
		table12 = [Vector2(1728, 624), Vector2(1824, 624), Vector2(1728, 728), Vector2(1824, 728)],
	},
	guests = {
		table1 = [], table2 = [], table3 = [], table4 = [], table5 = [], table6 = [],
		table7 = [], table8 = [], table9 = [], table10 = [], table11 = [], table12 = [],
	},
	drink_order_taken = [
		false, false, false, false, false, false,
		false, false, false, false, false, false
	],
	food_order_taken = [
		false, false, false, false, false, false,
		false, false, false, false, false, false
	],
	orders = {
		table1 = [], table2 = [], table3 = [], table4 = [], table5 = [], table6 = [],
		table7 = [], table8 = [], table9 = [], table10 = [], table11 = [], table12 = [],
	},
	check_delivered = [
		false, false, false, false, false, false,
		false, false, false, false, false, false
	],
}

var drink_orders = ["water", "tea", "bepis", "spripe", "dr popper"]

var food_orders = ["number 1", "number 2", "number 3"]

onready var table_buttons = [
	$POSZoom/POSScreen/Table1Button,
	$POSZoom/POSScreen/Table2Button,
	$POSZoom/POSScreen/Table3Button,
	$POSZoom/POSScreen/Table4Button,
	$POSZoom/POSScreen/Table5Button,
	$POSZoom/POSScreen/Table6Button,
	$POSZoom/POSScreen/Table7Button,
	$POSZoom/POSScreen/Table8Button,
	$POSZoom/POSScreen/Table9Button,
	$POSZoom/POSScreen/Table10Button,
	$POSZoom/POSScreen/Table11Button,
	$POSZoom/POSScreen/Table12Button,
]

func _ready():
	controlled_player = 1 # This will need to be adjusted for multiplayer
	# But I'm trying to prepare for that in the code as is
	ticks = OS.get_system_time_msecs()
	$POSZoom/POSScreen/BackButton.disabled = true
	pos_wall.visible = false
	pos_zoom.visible = false
	$Player1.visible = true
	$Player2.visible = true
	if $Player1.connect("interact", self, "_on_player_1_interact") != OK:
		print("Cannot connect signals")
	customer_walkin_timer.start()
	

func _process(_delta):
	if walk_in:
		var paths = customer_paths.get_children()
		var all_max_units = true
		var patrons = []
		for path in paths:
			var follower = path.get_child(0)
			patrons.append(follower.get_child(0))
			if follower.unit_offset < 1.0:
				follower.offset += 0.5
				all_max_units = false
		if all_max_units:
			walk_in = false
			var msec = OS.get_system_time_msecs()
			if msec - ticks >= 1000:
				emit_signal("ready_to_be_seated", patrons)
			ticks = msec
	
	if host_to_table:
		for path in get_node(host_path).get_children():
			if path.unit_offset < 1.0:
				path.offset += 1.0
			else:
				var msec = OS.get_system_time_msecs()
				if msec - ticks >= 1000:
					emit_signal("seat_guests")
				host_to_table = false
		
		if customer_to_host_path:
			if left_player_section:
				for path in left_paths.get_children():
					if path.get_child(0).unit_offset < 1.0:
						path.get_child(0).offset += 0.8
					else:
						pass
			else:
				var all_added = true
				var reset_path = []
				for path in right_paths.get_children():
					if path.get_children().size() == 0:
						continue
					
					if path.get_child(0).unit_offset < 1.0:
						path.get_child(0).offset += 0.8
						all_added = false
					
					if path.get_child(0).unit_offset == 1.0:
						path.get_child(0).queue_free()
						var pf2d = PathFollow2D.new()
						pf2d.rotate = false
						pf2d.loop = false
						pf2d.v_offset -= 28
						pf2d.offset = offset_queue[0]
						offset_queue.pop_front()
						pf2d.add_child(customer_npc.instance())
						get_node(host_path).add_child(pf2d)

				if all_added:
					print("all deleted")
					customer_to_host_path = false
			
	if host_back_to_host_stand:
		if get_node(host_path).get_child(0).unit_offset > 0.0:
			get_node(host_path).get_child(0).offset -= 1.0
		
		if get_node(host_path).get_child(0).unit_offset <= 0.0:
			host_back_to_host_stand = false
			if current_focused_table > 6:
				convo_string = "Hey Right, you've\nbeen sat at " + String(current_focused_table)
			else:
				convo_string = "Hey Left, you've\nbeen sat at " + String(current_focused_table)
			var conversation_dialogue = convo_dialogue.instance()
			$Dialogues.add_child(conversation_dialogue)	
			if dialogue_queue == null:
				dialogue_queue = []
			dialogue_queue.append([conversation_dialogue, 2])
			conversation_dialogue.rect_position = get_node(host_path).get_child(0).position
			conversation_dialogue.show()
			conversation_index = 0
			conversation_dialogue.get_child(2).connect("timeout", self, "_on_DialogueTimer_timeout")
			conversation_dialogue.get_child(2).start()
			get_node(host_path).get_child(0).queue_free()
			$Host_NPC.visible = true
	

func _on_player_1_interact():
#	show_hint = false
	$PopupDialog.hide()
	if pos_right_usable or pos_left_usable:
		if !pos_wall.visible:
			pos_wall.visible = true
			pos_zoom.visible = true
			$Player1.visible = false
			$Player1.movable = false
			$Player2.visible = false
		else:
			_on_BackButton_pressed()
			pos_wall.visible = false
			pos_zoom.visible = false
			$Player1.visible = true
			$Player1.movable = true
			$Player2.visible = true


# POS LOGIC
####################################################################################################
func _on_Table1Button_pressed():
	selected_table = 1
	_go_to_table_menu()


func _on_Table2Button_pressed():
	selected_table = 2
	_go_to_table_menu()


func _on_Table3Button_pressed():
	selected_table = 3
	_go_to_table_menu()
	
	
func _on_Table4Button_pressed():
	selected_table = 4
	_go_to_table_menu()
	
	
func _on_Table5Button_pressed():
	selected_table = 5
	_go_to_table_menu()
	
	
func _on_Table6Button_pressed():
	selected_table = 6
	_go_to_table_menu()
	
	
func _on_Table7Button_pressed():
	selected_table = 7
	_go_to_table_menu()
	
	
func _on_Table8Button_pressed():
	selected_table = 8
	_go_to_table_menu()
	
	
func _on_Table9Button_pressed():
	selected_table = 9
	_go_to_table_menu()

	
func _on_Table10Button_pressed():
	selected_table = 10
	_go_to_table_menu()

	
func _on_Table11Button_pressed():
	selected_table = 11
	_go_to_table_menu()

	
func _on_Table12Button_pressed():
	selected_table = 12
	_go_to_table_menu()


func _on_POS_right_area_entered(_area):
	if show_hint:
		$PopupDialog.rect_position = Vector2($LevelSprites/POS1.position.x - 40, $LevelSprites/POS1.position.y - 60)
		$PopupDialog.popup()
	pos_right_usable = true


func _on_POS_left_area_entered(_area):
	if show_hint:
		$PopupDialog.rect_position = Vector2($LevelSprites/POS2.position.x - 40, $LevelSprites/POS2.position.y - 60)
		$PopupDialog.popup()
	pos_left_usable = true


func _on_POS_right_area_exited(_area):
	$PopupDialog.hide()
	pos_right_usable = false


func _on_POS_left_area_exited(_area):
	$PopupDialog.hide()
	pos_left_usable = false

	
func _go_to_table_menu():
	for table in table_buttons:
		table.disabled = true
	$POSZoom/POSScreen/BackButton.disabled = false
	pos_screen.set_texture(pos_table_menu)


func _on_BackButton_pressed():
	for table in table_buttons:
		table.disabled = false
	$POSZoom/POSScreen/BackButton.disabled = true
	pos_screen.set_texture(pos_default_screen)


####################################################################################################

# TABLES LOGIC
####################################################################################################
func _on_Table1_area_entered(_area):
	set_table_popup($Area2Ds/TableAreas/Table1, 1)


func _on_Table1_area_exited(_area):
	hide_table_popup(1)
	

func _on_Table2_area_entered(_area):
	set_table_popup($Area2Ds/TableAreas/Table2, 2)


func _on_Table2_area_exited(_area):
	hide_table_popup(2)


func _on_Table3_area_entered(_area):
		set_table_popup($Area2Ds/TableAreas/Table3, 3)


func _on_Table3_area_exited(_area):
	hide_table_popup(3)


func _on_Table4_area_entered(_area):
	set_table_popup($Area2Ds/TableAreas/Table4, 4)


func _on_Table4_area_exited(_area):
	hide_table_popup(4)


func _on_Table5_area_entered(_area):
	set_table_popup($Area2Ds/TableAreas/Table5, 5)


func _on_Table5_area_exited(_area):
	hide_table_popup(5)


func _on_Table6_area_entered(_area):
	set_table_popup($Area2Ds/TableAreas/Table6, 6)


func _on_Table6_area_exited(_area):
	hide_table_popup(6)


func _on_Table7_area_entered(_area):
	set_table_popup($Area2Ds/TableAreas/Table7, 7)


func _on_Table7_area_exited(_area):
	hide_table_popup(7)


func _on_Table8_area_entered(_area):
	set_table_popup($Area2Ds/TableAreas/Table8, 8)


func _on_Table8_area_exited(_area):
	hide_table_popup(8)


func _on_Table9_area_entered(_area):
	set_table_popup($Area2Ds/TableAreas/Table9, 9)


func _on_Table9_area_exited(_area):
	hide_table_popup(9)


func _on_Table10_area_entered(_area):
	set_table_popup($Area2Ds/TableAreas/Table10, 10)


func _on_Table10_area_exited(_area):
	hide_table_popup(10)


func _on_Table11_area_entered(_area):
	set_table_popup($Area2Ds/TableAreas/Table11, 11)


func _on_Table11_area_exited(_area):
	hide_table_popup(11)


func _on_Table12_area_entered(_area):
	set_table_popup($Area2Ds/TableAreas/Table12, 12)


func _on_Table12_area_exited(_area):
	hide_table_popup(12)


func set_table_popup(var table, var number):
	$PopupDialog.rect_position = table.position
	$PopupDialog.rect_position.x -= 42
	if number == 5 or number == 6 or number == 11 or number == 12:
		$PopupDialog.rect_position.x += 12
	$PopupDialog.popup()
	tables['tables_entered'][number - 1] = true

	
func hide_table_popup(var number):
	tables['tables_entered'][number - 1] = false	
	var all_exited = true
	for table in tables['tables_entered']:
		if table == true:
			all_exited = false
	if all_exited:		
		$PopupDialog.hide()

	
####################################################################################################

# SODA LOGIC
####################################################################################################
func _on_Soda1_area_entered(_area):
	show_soda_popup($Area2Ds/SodaAreas/Soda1)


func _on_Soda1_area_exited(_area):
	hide_soda_popup()


func _on_Soda2_area_entered(_area):
	show_soda_popup($Area2Ds/SodaAreas/Soda2)


func _on_Soda2_area_exited(_area):
	hide_soda_popup()


func _on_Soda3_area_entered(_area):
	show_soda_popup($Area2Ds/SodaAreas/Soda3)


func _on_Soda3_area_exited(_area):
	hide_soda_popup()


func _on_Soda4_area_entered(_area):
	show_soda_popup($Area2Ds/SodaAreas/Soda4)


func _on_Soda4_area_exited(_area):
	hide_soda_popup()

	
func show_soda_popup(var machine):
	soda_machine_area_entered = true
	$PopupDialog.rect_position = machine.position
	$PopupDialog.popup()

	
func hide_soda_popup():
	soda_machine_area_entered = false
	$PopupDialog.hide()


####################################################################################################

# TRASH LOGIC
####################################################################################################
func _on_Trash1_area_entered(_area):
	show_trash_popup($Area2Ds/TrashAreas/Trash1)


func _on_Trash1_area_exited(_area):
	hide_trash_popup()


func _on_Trash2_area_entered(_area):
	show_trash_popup($Area2Ds/TrashAreas/Trash2)


func _on_Trash2_area_exited(_area):
	hide_trash_popup()

	
func show_trash_popup(var trashcan):
	trash_area_entered = true
	$PopupDialog.rect_position = trashcan.position
	$PopupDialog.rect_position.x -= 20
	$PopupDialog.rect_position.y -= 65
	$PopupDialog.show()

	
func hide_trash_popup():
	trash_area_entered = false
	$PopupDialog.hide()

	
####################################################################################################

# EXPO LOGIC
####################################################################################################
func _on_Expo1_area_entered(_area):
	show_expo_popup($Area2Ds/ExpoAreas/Expo1)


func _on_Expo1_area_exited(_area):
	hide_expo_popup()


func _on_Expo2_area_entered(_area):
	show_expo_popup($Area2Ds/ExpoAreas/Expo2)


func _on_Expo2_area_exited(_area):
	hide_expo_popup()


func show_expo_popup(var expo):
	expo_area_entered = true
	$PopupDialog.rect_position = expo.position
	$PopupDialog.rect_position.x += 52
	$PopupDialog.rect_position.y -= 80
	$PopupDialog.show()


func hide_expo_popup():
	expo_area_entered = false
	$PopupDialog.hide()

	
####################################################################################################

# DISHPIT LOGIC
####################################################################################################
func _on_DishPit1_area_entered(_area):
	show_dish_popup($Area2Ds/DishAreas/DishPit1, false)


func _on_DishPit1_area_exited(_area):
	hide_dish_popup()


func _on_DishPit2_area_entered(_area):
	show_dish_popup($Area2Ds/DishAreas/DishPit2, true)


func _on_DishPit2_area_exited(_area):
	hide_dish_popup()


func show_dish_popup(var dishpit, var b):
	dish_area_entered = true
	$PopupDialog.rect_position = dishpit.position
	if b:
		$PopupDialog.rect_position.x -= 80
	$PopupDialog.rect_position.y += 80
	$PopupDialog.show()

	
func hide_dish_popup():
	dish_area_entered = false
	$PopupDialog.hide()

	
####################################################################################################
func _on_CustomerWalkInTimer_timeout():
	if opening_restaurant:
		opening_restaurant = false
		customer_walkin_timer.wait_time = 45
	
	var paths = customer_paths.get_children()
	for path in paths:
		var instance = customer_npc.instance()
		path.get_child(0).add_child(instance)
	
	walk_in = true


func _on_Restaurant_Level_ready_to_be_seated(patrons):
	convo_string = "Hi!\nWelcome to PomoBITE!\nI'll take you to\nyour table!"
	var conversation_dialogue = convo_dialogue.instance()
	if dialogue_queue == null:
		dialogue_queue = []
	dialogue_queue.append([conversation_dialogue, 0])
	$Dialogues.add_child(conversation_dialogue)
	conversation_dialogue.rect_position = $Host_NPC.position
	conversation_dialogue.show()
	conversation_index = 0
	conversation_dialogue.get_child(2).start()
	conversation_dialogue.get_child(2).connect("timeout", self, "_on_DialogueTimer_timeout")


func _on_DialogueTimer_timeout():
	var conversation_dialogue = dialogue_queue[0][0]
	var convo_type = dialogue_queue[0][1]
	var label = conversation_dialogue.get_child(1)
	if convo_type == 0:
		label.text += convo_string[conversation_index]
		conversation_index += 1
		if conversation_index == convo_string.length():
			dialogue_queue.pop_front()
			conversation_index = 0
			conversation_dialogue.get_child(2).stop()
			yield(get_tree().create_timer(1.0), "timeout")
			label.text = ""
			conversation_dialogue.hide()
			$Dialogues.remove_child(conversation_dialogue)
			var from
			var to
			if left_player_section:
				from = 0
				to = 6
			else:
				from = 6
				to = 12
			for i in range(from, to):
				if !tables["tables_sat"][i]:
					tables["tables_sat"][i] = true
					host_path = "Paths/HostPaths/HostToTable" + String(i + 1)
					current_focused_table = i + 1
					var pf2d = PathFollow2D.new()
					pf2d.loop = false
					pf2d.rotate = false
					pf2d.v_offset -= 28
					var host_instance = host_npc.instance()
					pf2d.add_child(host_instance)
					get_node(host_path).add_child(pf2d)
					$Host_NPC.visible = false
					host_to_table = true
					if left_player_section:
						for path in left_paths.get_children():
							var customer = customer_npc.instance()
							path.get_child(0).add_child(customer)
					else:
						offset_queue = [120, 20, 180, 80]
						for path in right_paths.get_children():
							var follower = PathFollow2D.new()
							follower.rotate = false
							follower.loop = false
							follower.add_child(customer_npc.instance())
							path.add_child(follower)
					for customer in customer_paths.get_children():
						customer.get_child(0).offset = 0.0
					
					customer_to_host_path = true
					break
					
	else:
		label.text += convo_string[conversation_index]
		conversation_index += 1
		if conversation_index == convo_string.length():
			dialogue_queue.pop_front()
			conversation_index = 0
			conversation_dialogue.get_child(2).stop()
			yield(get_tree().create_timer(1.0), "timeout")
			label.text = ""
			conversation_dialogue.hide()
			$Dialogues.remove_child(conversation_dialogue)
			if convo_type == 1:
				emit_signal("return_to_host_stand")
			

func _on_Restaurant_Level_seat_guests():
	var hp = get_node(host_path).get_children()
	for i in range(1, hp.size()):
		hp[i].get_child(0).queue_free()
	for i in range(0, 4):
		var customer = customer_npc.instance()
		var table = "table" + String(current_focused_table)
		customer.position = tables["seat_positions"][table][i]
		$Customers.add_child(customer)
		
	convo_string = "Your server will be\nright with you.\nEnjoy your meal!"
	var conversation_dialogue = convo_dialogue.instance()
	$Dialogues.add_child(conversation_dialogue)	
	if dialogue_queue == null:
		dialogue_queue = []
	dialogue_queue.append([conversation_dialogue, 1])
	conversation_dialogue.rect_position = get_node(host_path).get_child(0).position
	conversation_dialogue.show()
	conversation_index = 0
	conversation_dialogue.get_child(2).start()
	conversation_dialogue.get_child(2).connect("timeout", self, "_on_DialogueTimer_timeout")


func _on_Restaurant_Level_return_to_host_stand():
	host_back_to_host_stand = true
