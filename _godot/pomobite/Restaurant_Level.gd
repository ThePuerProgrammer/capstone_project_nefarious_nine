extends Node2D

# <As a> Customer_NPC, <I want to> leave a tip of varying amounts <so that> I can express my gratitude to my waiter for their service
# <As a> Customer_NPC, <I want to> express my frustration for poor service <so that> my waiter will understand that I am not recieving quality care

signal ready_to_be_seated(patrons)
signal seat_guests()
signal return_to_host_stand()

onready var _is_host = true
var _player_number
var players

onready var pos_wall 					= $POSWall
onready var pos_zoom 					= $POSZoom
onready var pos_screen 					= $POSZoom/POSScreen
onready var customer_paths 				= $Paths/CustomerPaths
onready var customer_walkin_timer		= $CustomerWalkInTimer
onready var right_paths					= $Paths/FollowHostPaths/RightPaths
onready var left_paths					= $Paths/FollowHostPaths/LeftPaths
onready var chef_c						= $Paths/ChefPaths/ChefCPath/PathFollow2D/Chef_NPC
onready var chef_d						= $Paths/ChefPaths/ChefDPath/PathFollow2D/Chef_NPC

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
onready var table_exiting				= [false, 0]
onready var customer_path_h_offset		= 200
onready var server_at_table				= [false, 0]
onready var has_drinks					= false
onready var dialogue_active				= false
onready var conversation_index			= 0
onready var make_food					= [false, []]
onready var ordering_table				= -1
onready var carrying_trash				= false
onready var carrying_dishes				= true
onready var chefs_cursing				= false
onready var cursing_array				= []
onready var food_in_window				= false
onready var has_food					= false

var anger_timer : Timer
var food_in_window_timer : Timer
 
const table_stay_time	= 225
const TERMINATE_CONVO_VALUE = 1000

var pos_table_menu 		= preload("res://assets/textures/PomoBITE_Textures/Table_Menu.png")
var pos_default_screen 	= preload("res://assets/textures/PomoBITE_Textures/Inner_Monitor_Tables.png")
var customer_npc		= preload("res://pomobite/Customer_NPC.tscn")
var host_npc			= preload("res://pomobite/Host_NPC.tscn")
var convo_dialogue		= preload("res://pomobite/ConversationDialogue.tscn")
var dirty_table			= preload('res://pomobite/DirtyTable.tscn')
var cursing_particles	= preload('res://pomobite/CursingParticles.tscn')

var selected_table 		= 1
var show_hint 			= true
var ticks				
var controlled_player
var host_path
var offset_queue
var current_focused_table
var dialogue_queue
var player_1_position
var player_2_position

var _relay_client : ClientMgr

var convo_strings = []

var tables = {
	tables_entered = [
		false, false, false, false, false, false,
		false, false, false, false, false, false
	],
	tables_sat = [
		false, false, false, false, false, false,
		false, false, false, false, false, false
	],
	table_positions = [
		Vector2(1.0,1.0),   Vector2(1.0,1.0),   Vector2(1.0,1.0), 
		Vector2(1.0,1.0),   Vector2(1.0,1.0),   Vector2(1.0,1.0),
		Vector2(1552, 240), Vector2(1776, 240), Vector2(1552, 432), 
		Vector2(1776, 432), Vector2(1480, 672), Vector2(1704, 672),
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
	drinks_delivered = [
		false, false, false, false, false, false,
		false, false, false, false, false, false
	],
	food_order_taken = [
		false, false, false, false, false, false,
		false, false, false, false, false, false
	],
	given_order = [
		[],[],[],[],[],[],[],[],[],[],[],[],
	],
	orders = {
		table1 = [], table2 = [], table3 = [], table4 = [], table5 = [], table6 = [],
		table7 = [], table8 = [], table9 = [], table10 = [], table11 = [], table12 = [],
	},
	questions = [
		[],[],[],[],[],[],[],[],[],[],[],[],
	],
	check_delivered = [
		false, false, false, false, false, false,
		false, false, false, false, false, false
	],
	table_dirty = [
		false, false, false, false, false, false,
		false, false, false, false, false, false
	],
	leaving_queue = [],
}

onready var order_pos_queue = []
onready var food_order_list = []

var leaving_timers_queue = []

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

onready var order_menu_buttons = [
	$POSZoom/POSScreen/BackButton,
	$POSZoom/POSScreen/OneMinusButton,
	$POSZoom/POSScreen/OnePlusButton,
	$POSZoom/POSScreen/TwoMinusButton,
	$POSZoom/POSScreen/TwoPlusButton,
	$POSZoom/POSScreen/ThreeMinusButton,
	$POSZoom/POSScreen/ThreePlusButton,
	$POSZoom/POSScreen/OrderButton
]

onready var order_menu_labels = [
	$POSZoom/POSScreen/WarningOrderLabel,
	$POSZoom/POSScreen/MenuOption1Label,
	$POSZoom/POSScreen/MenuOption2Label,
	$POSZoom/POSScreen/MenuOption3Label,
]

func setup(player_number : int, relay_client : ClientMgr): # Called by multiplayer engine
	_is_host = player_number == 0
	_relay_client = relay_client
	controlled_player = player_number + 1

	if _relay_client.connect("on_message", self, '_on_message') != OK:
		pass
		
	players = get_tree().get_nodes_in_group("players")
	var player = players[player_number]
	

func _ready():
	MenuMusic.get_child(0).stop()
#	controlled_player = 1 # This will need to be adjusted for multiplayer
	# But I'm trying to prepare for that in the code as is
	ticks = OS.get_system_time_msecs()
	for button in order_menu_buttons:
		button.disabled = true
	pos_wall.visible = false
	pos_zoom.visible = false
	$Player1.visible = true
	$Player2.visible = true
	if $Player1.connect("interact", self, "_on_player_1_interact") != OK:
		print("Cannot connect signals")
	customer_walkin_timer.start()
	
	var cursing_c = cursing_particles.instance()
	cursing_c.visible = false
	var cursing_d = cursing_particles.instance()
	cursing_d.visible = false
	cursing_array.append(cursing_c)
	cursing_array.append(cursing_d)
	anger_timer = Timer.new()
	add_child(anger_timer)
	chef_c.add_child(cursing_c)
	chef_d.add_child(cursing_d)
	food_in_window_timer = Timer.new()
	food_in_window_timer.one_shot = true
	food_in_window_timer.wait_time = 10
	food_in_window_timer.connect("timeout", self, "_put_food_in_window")
	add_child(food_in_window_timer)
	
	
func _on_message(msg):
	if msg.content and msg.content.has('player_1_position'):
		player_1_position = msg.content['player_1_position']
	if msg.content and msg.content.has('player_2_position'):
		player_2_position = msg.content['player_2_position']

func _process(_delta):
	if _is_host:
		$Player1.movable = true
		$Player1.interactable = true
		$Player2.movable = false
		$Player2.interactable = false
		
	else:
		$Player1.movable = false	
		$Player1.interactable = false
		$Player2.movable = true
		$Player2.interactable = true
	
	if !_is_host:
		if player_1_position:
			$Player1.position = player_1_position
		
		var msg = Message.new()
		msg.content = {}
		msg.is_echo = false
		msg.start_pomobite = false
		msg.game_start = false
		msg.server_login = false
		msg.content['player_2_position'] = $Player2.position
		_relay_client.send_data(msg)
		
		return
		
	if player_2_position:
		$Player2.position = player_2_position
	
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
				for path in right_paths.get_children():
					if path.get_children().size() == 0:
						continue
					
					if path.get_child(0).unit_offset < 1.0:
						path.get_child(0).offset += 0.8
						all_added = false
						continue
					
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
					customer_to_host_path = false
					
			
	if host_back_to_host_stand:
		if get_node(host_path).get_child(0).unit_offset > 0.0:
			get_node(host_path).get_child(0).offset -= 1.0
		
		if get_node(host_path).get_child(0).unit_offset <= 0.0:
			host_back_to_host_stand = false
			var notify_server_string = ""
			if current_focused_table > 6:
				notify_server_string = "Hey Right, you've\nbeen sat at " + String(current_focused_table)
			else:
				notify_server_string = "Hey Left, you've\nbeen sat at " + String(current_focused_table)
			_gen_dialogue(notify_server_string, TERMINATE_CONVO_VALUE, get_node(host_path).get_child(0).position)
			get_node(host_path).get_child(0).queue_free()
			$Host_NPC.visible = true
			$Host_NPC/CollisionShape2D.disabled = false
		
	if _relay_client != null:	
		var msg = Message.new()
		msg.content = {}
		msg.is_echo = false
		msg.start_pomobite = false
		msg.game_start = false
		msg.server_login = false
		msg.content['player_1_position'] = $Player1.position
		_relay_client.send_data(msg)
			

func _on_player_1_interact():
#	show_hint = false
	$PopupCanvas/PopupDialog.hide()
	if pos_right_usable or pos_left_usable:
		if !pos_wall.visible:
			for cl in $Dialogues.get_children():
				cl.layer = -1
			pos_wall.visible = true
			pos_zoom.visible = true
			$Player1.visible = false
			$Player1.movable = false
			$Player2.visible = false
			for d in $Dialogues.get_children():
				d.get_child(0).visible = false
		else:
			for cl in $Dialogues.get_children():
				cl.layer = 4
			_on_BackButton_pressed()
			pos_wall.visible = false
			pos_zoom.visible = false
			$Player1.visible = true
			$Player1.movable = true
			$Player2.visible = true
			for d in $Dialogues.get_children():
				d.get_child(0).visible = true
			
	elif server_at_table[0]:
		var table_number = server_at_table[1]
		if !tables['drink_order_taken'][table_number - 1] and tables['tables_sat'][table_number - 1]:
			tables['drink_order_taken'][table_number - 1] = true
			order_pos_queue = tables['seat_positions']['table' + String(table_number)].duplicate()
			_greet_table()
		elif has_drinks && !tables['drinks_delivered'][table_number - 1] and tables['tables_sat'][table_number - 1]:
			ordering_table = table_number
			order_pos_queue = tables['seat_positions']['table' + String(table_number)].duplicate()
			has_drinks = false;
			_deliver_drinks(table_number - 1)
		
			
	elif soda_machine_area_entered:
		has_drinks = true
		
	elif expo_area_entered and food_in_window:
		$Window_Food.visible = false
		has_food = true
			
			
func _deliver_drinks(table):
	tables['drinks_delivered'][table] = true
	print("delivered at ", table)
	_take_food_order()
	
func _take_food_order():
	_gen_dialogue(\
	"Here are your drinks!\nWhat would you like\nto order?",\
	3,\
	$Player1.position if _is_host else $Player2.position)
	
func _greet_table():
	_gen_dialogue(\
	"Hi! I'll be\nyour server. Can I\nget you something\nto drink?",\
	2, \
	$Player1.position if _is_host else $Player2.position)

func _gen_dialogue(msg, type, pos):
	convo_strings.push_back(msg)
	var cl = CanvasLayer.new()
	cl.layer = 4
	var conversation_dialogue = convo_dialogue.instance()
	if dialogue_queue == null:
		dialogue_queue = []
	cl.add_child(conversation_dialogue)
	dialogue_queue.append([conversation_dialogue, type])
	$Dialogues.add_child(cl)
	conversation_dialogue.rect_position = pos
	conversation_dialogue.show()
	conversation_dialogue.get_child(2).start()
	conversation_dialogue.get_child(2).connect("timeout", self, "_on_DialogueTimer_timeout")

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
	

func _on_OneMinusButton_pressed():
	_remove_foor_from_order(1)


func _on_OnePlusButton_pressed():
	_add_food_to_order(1)


func _on_TwoMinusButton_pressed():
	_remove_foor_from_order(2)


func _on_TwoPlusButton_pressed():
	_add_food_to_order(2)


func _on_ThreeMinusButton_pressed():
	_remove_foor_from_order(3)


func _on_ThreePlusButton_pressed():
	_add_food_to_order(3)


func _add_food_to_order(num):
	if food_order_list.size() < 4:
		food_order_list.append(num)

func _remove_foor_from_order(num):
	if food_order_list.size() > 0:
		var index = food_order_list.find_last(num)
		food_order_list.remove(index)


func _on_OrderButton_pressed():
	if tables['given_order'][selected_table - 1].size() == 0:
		food_order_list = []
		$POSZoom/POSScreen/WarningOrderLabel.text = "Take the table's order first!"
		$POSZoom/POSScreen/WarningOrderLabel.visible = true
		return
		
	if food_order_list.size() < 4:
		$POSZoom/POSScreen/WarningOrderLabel.text = "Must have 4 items to order"		
		$POSZoom/POSScreen/WarningOrderLabel.visible = true
		return
		
	make_food = [true, food_order_list.duplicate()]
	tables['orders']['table' + String(selected_table)] = food_order_list.duplicate()
	food_order_list = []
	
	chefs_cursing = true
	anger_timer.one_shot = true
	anger_timer.wait_time = 3
	for p in cursing_array:
		p.visible = true
	anger_timer.connect("timeout", self, '_on_anger_timer_timeout')
	anger_timer.start()
	food_in_window_timer.start()
	
	_on_BackButton_pressed()
	
func _on_anger_timer_timeout():
	print("timeout")
	for p in cursing_array:
		p.visible = false


func _on_POS_right_area_entered(_area):
	if show_hint:
		$PopupCanvas/PopupDialog.rect_position = Vector2($LevelSprites/POS1.position.x - 40, $LevelSprites/POS1.position.y - 60)
		$PopupCanvas/PopupDialog.popup()
	pos_right_usable = true


func _on_POS_left_area_entered(_area):
	if show_hint:
		$PopupCanvas/PopupDialog.rect_position = Vector2($LevelSprites/POS2.position.x - 40, $LevelSprites/POS2.position.y - 60)
		$PopupCanvas/PopupDialog.popup()
	pos_left_usable = true


func _on_POS_right_area_exited(_area):
	$PopupCanvas/PopupDialog.hide()
	pos_right_usable = false


func _on_POS_left_area_exited(_area):
	$PopupCanvas/PopupDialog.hide()
	pos_left_usable = false

	
func _go_to_table_menu():
	if !tables['tables_sat'][selected_table - 1]:
		return
		
	if tables['given_order'][selected_table - 1].size() == 0:
		for label in order_menu_labels:
			label.text = "Take the tables order first!"
	else:
		var i = 0
		for label in order_menu_labels:
			label.text = tables['questions'][selected_table - 1][i][0]
			i += 1
		
	for table in table_buttons:
		table.disabled = true
	for button in order_menu_buttons:
		button.disabled = false
	for label in order_menu_labels:
		label.visible = true
	$POSZoom/POSScreen/WarningOrderLabel.visible = false
	pos_screen.set_texture(pos_table_menu)


func _on_BackButton_pressed():
	for table in table_buttons:
		table.disabled = false
	for button in order_menu_buttons:
		button.disabled = true
	for label in order_menu_labels:
		label.visible = false
	pos_screen.set_texture(pos_default_screen)
	food_order_list = []


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
	_server_at_table(true, number)
	$PopupCanvas/PopupDialog.rect_position = table.position
	$PopupCanvas/PopupDialog.rect_position.x -= 42
	if number == 5 or number == 6 or number == 11 or number == 12:
		$PopupCanvas/PopupDialog.rect_position.x += 12
	$PopupCanvas/PopupDialog.popup()
	tables['tables_entered'][number - 1] = true

	
func hide_table_popup(var number):
	_server_at_table(false, 0)
	tables['tables_entered'][number - 1] = false	
	var all_exited = true
	for table in tables['tables_entered']:
		if table == true:
			all_exited = false
	if all_exited:		
		$PopupCanvas/PopupDialog.hide()

func _server_at_table(is_at_table, table_num):
	server_at_table[0] = is_at_table
	server_at_table[1] = table_num
	
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
	$PopupCanvas/PopupDialog.rect_position = machine.position
	$PopupCanvas/PopupDialog.popup()

	
func hide_soda_popup():
	soda_machine_area_entered = false
	$PopupCanvas/PopupDialog.hide()


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
	$PopupCanvas/PopupDialog.rect_position = trashcan.position
	$PopupCanvas/PopupDialog.rect_position.x -= 20
	$PopupCanvas/PopupDialog.rect_position.y -= 65
	$PopupCanvas/PopupDialog.show()

	
func hide_trash_popup():
	trash_area_entered = false
	$PopupCanvas/PopupDialog.hide()

	
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
	$PopupCanvas/PopupDialog.rect_position = expo.position
	$PopupCanvas/PopupDialog.rect_position.x += 52
	$PopupCanvas/PopupDialog.rect_position.y -= 80
	$PopupCanvas/PopupDialog.show()


func hide_expo_popup():
	expo_area_entered = false
	$PopupCanvas/PopupDialog.hide()

	
####################################################################################################

# DISHPIT LOGIC
####################################################################################################
func _on_DishPit1_area_entered(_area):
	show_dish_popup($Area2Ds/DishAreas/DishPit1, false)
	$LeftDishwasher/Particles2D.visible = true

func _on_DishPit1_area_exited(_area):
	hide_dish_popup()
	$LeftDishwasher/Particles2D.visible = false

func _on_DishPit2_area_entered(_area):
	show_dish_popup($Area2Ds/DishAreas/DishPit2, true)
	$RightDishwasher/Particles2D.visible = true

func _on_DishPit2_area_exited(_area):
	hide_dish_popup()
	$RightDishwasher/Particles2D.visible = false

func show_dish_popup(var dishpit, var b):
	dish_area_entered = true
	$PopupCanvas/PopupDialog.rect_position = dishpit.position
	if b:
		$PopupCanvas/PopupDialog.rect_position.x -= 80
	$PopupCanvas/PopupDialog.rect_position.y += 80
	$PopupCanvas/PopupDialog.show()

	
func hide_dish_popup():
	dish_area_entered = false
	$PopupCanvas/PopupDialog.hide()

	
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


func _on_Restaurant_Level_ready_to_be_seated(_patrons):
	_gen_dialogue("Hi!\nWelcome to PomoBITE!\nI'll take you to\nyour table!", 0, $Host_NPC.position)

func _on_DialogueTimer_timeout():
	var conversation_dialogue = dialogue_queue[0][0]
	var convo_type = dialogue_queue[0][1]
	var label = conversation_dialogue.get_child(1)
	if convo_type == 0:
		label.text += convo_strings[0][conversation_index]
		conversation_index += 1
		if conversation_index == convo_strings[0].length():
			conversation_index = 0
			convo_strings.pop_front()
			dialogue_queue.pop_front()
			conversation_index = 0
			conversation_dialogue.get_child(2).stop()
			yield(get_tree().create_timer(1.0), "timeout")
			label.text = ""
			conversation_dialogue.hide()
			$Dialogues.remove_child(conversation_dialogue.get_parent())
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
					$Host_NPC/CollisionShape2D.disabled = true
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
		label.text += convo_strings[0][conversation_index]
		conversation_index += 1
		if conversation_index == convo_strings[0].length():
			conversation_index = 0			
			convo_strings.pop_front()
			dialogue_queue.pop_front()
			conversation_index = 0
			conversation_dialogue.get_child(2).stop()
			yield(get_tree().create_timer(1.0), "timeout")
			label.text = ""
			conversation_dialogue.hide()
			$Dialogues.remove_child(conversation_dialogue.get_parent())
			if convo_type == 1:
				emit_signal("return_to_host_stand")
			if convo_type == 2:
				var a = _guests_order_drinks()
				while a is GDScriptFunctionState:
					a = yield(a, 'completed')
				var b = _guests_order_drinks()
				while b is GDScriptFunctionState:
					b = yield(b, 'completed')
				var c = _guests_order_drinks()
				while c is GDScriptFunctionState:
					c = yield(c, 'completed')
				_guests_order_drinks()
			if convo_type == 3:
				var a = _guests_order_food()
				while a is GDScriptFunctionState:
					a = yield(a, 'completed')
				var b = _guests_order_food()
				while b is GDScriptFunctionState:
					b = yield(b, 'completed')
				var c = _guests_order_food()
				while c is GDScriptFunctionState:
					c = yield(c, 'completed')
				_guests_order_food()
			

func _guests_order_food():
	# GENERATE FLASHCARD!!!!!
	var flashcard = Pomotimer.getRandomFlashcard()
	tables['questions'][ordering_table - 1].append(flashcard)
	
	print("FC Question = ", flashcard[0])
	print("FC Answer = ", flashcard[1])
	for each in flashcard[2]:
		print("Wrong answer = ", each)
	
	var rando = RandomNumberGenerator.new()
	rando.seed = hash(String(order_pos_queue.front()[0] + order_pos_queue.front()[1]))
	rando.randomize()
	var order = rando.randi_range(0, 2)
	tables['given_order'][ordering_table - 1].append(order)
	var food = food_orders[order]
	_gen_dialogue(food, TERMINATE_CONVO_VALUE, order_pos_queue.front())
	order_pos_queue.pop_front()
	yield(get_tree().create_timer(0.5), "timeout")
	return true

func _guests_order_drinks():
	var rando = RandomNumberGenerator.new()
	rando.seed = hash(String(order_pos_queue.front()[0] + order_pos_queue.front()[1]))
	rando.randomize()
	var order = rando.randi_range(0, 4)
	var drink = drink_orders[order]
	_gen_dialogue(drink, TERMINATE_CONVO_VALUE, order_pos_queue.front())
	order_pos_queue.pop_front()
	yield(get_tree().create_timer(0.5), "timeout")
	return true

func _on_Restaurant_Level_seat_guests():
	var hp = get_node(host_path).get_children()
	for i in range(1, hp.size()):
		hp[i].get_child(0).queue_free()
		hp[i].queue_free()
	for i in range(0, 4):
		var customer = customer_npc.instance()
		customer.table = current_focused_table
		var table = "table" + String(current_focused_table)
		customer.position = tables["seat_positions"][table][i]
		$Customers.add_child(customer)
	tables['leaving_queue'].push_back(current_focused_table)
	var timer = Timer.new()
	timer.wait_time = table_stay_time
	timer.one_shot = true
	timer.connect("timeout", self, "_table_leaving")
	add_child(timer)
	timer.start()
	
	leaving_timers_queue.push_back(timer)
	
	_gen_dialogue("Your server will be\nright with you.\nEnjoy your meal!", 1, get_node(host_path).get_child(0).position)


func _on_Restaurant_Level_return_to_host_stand():
	host_back_to_host_stand = true


func _table_leaving():
	var leaving_table = tables['leaving_queue'].front()
	tables['leaving_queue'].pop_front()
	var timer = leaving_timers_queue.front()
	leaving_timers_queue.pop_front()
	timer.queue_free()
	var path = $Paths/HostPaths.get_child(leaving_table - 1)
	
	# leave dirty dishes iff they recieved food
	if tables['check_delivered'][leaving_table - 1]:
		tables['table_dirty'][leaving_table - 1] = true
		var pos = tables['table_positions'][leaving_table - 1]
		var dishes = dirty_table.instance()
		dishes.position = pos
		dishes.table = leaving_table - 1
		$Dishes.add_child(dishes)
	
	# RESET THE TABLE
	tables['tables_sat'][leaving_table - 1] = false
	tables['guests']['table' + String(leaving_table)] = []
	tables['drink_order_taken'][leaving_table - 1] = false
	tables['drinks_delivered'][leaving_table - 1] = false
	tables['food_order_taken'][leaving_table - 1] = false
	tables['given_order'][leaving_table - 1] = []
	tables['orders']['table' + String(leaving_table)] = []
	tables['questions'][leaving_table - 1] = []
	tables['check_delivered'][leaving_table - 1] = false
	
	var children = path.get_children()
	for child in children:
		child.queue_free()
#	var offset_decrementer = 1.0		
	for customer in $Customers.get_children():
		if customer.table == leaving_table:
			customer.queue_free()
			# FOR NOW... the guests will just blip out of the restaurant
#			var new_customer = customer_npc.instance()
#			var pf2d = PathFollow2D.new()
#			pf2d.unit_offset = offset_decrementer
#			offset_decrementer -= .05
#			pf2d.loop = false
#			pf2d.rotate = false
#			pf2d.add_child(new_customer)
#			$Paths/HostPaths.get_child(leaving_table - 1).add_child(pf2d)
			
	table_exiting[0] = true
	table_exiting[1] = leaving_table
	
func _put_food_in_window():
	food_in_window = true
	$Window_Food.visible = true


