extends Control

onready var game_detail_label=$"Game_Selection/VSplit_Game_Container/Game_Details_Label"
onready var method_selection_optionbutton=$"Method_Selection_Button"
onready var deck_selection_optionbutton=$"Deck_Selection_Button"
onready var category_selection_optionbutton=$"Category_Selection_Button"
onready var timer_selection_optionbutton=$"Timer_Selection_Button"

var game_selection_array = []
var dungeon_selected=false
var pomoblast_selected=false

func _ready():
	$FadeIn.show()
	$FadeIn.fade_in()
	
	#Button Disabled
	disable_category_selection_option()
	disable_deck_selection_option()

	#Needed Items From The Start
	add_items_to_selection_method()
	add_items_to_timer_selection()
	method_selection_optionbutton.connect("item_selected",self,"on_item_selected")

func _on_FadeOut_fade_out_finished():
	if get_tree().change_scene('res://Menu/MenuScreen.tscn') != OK:
		print("Could not change to MenuScreen.tscn")

func _on_FadeIn_fade_in_finished():
	$FadeIn.hide()



####################################################################################################
#BACK AND START BUTTONS
####################################################################################################
#Back Button
func _on_Back_Button_pressed():
	$FadeOut.show()
	$FadeOut.fade_out()
#Start Button
func _on_Start_Button_pressed():
	if dungeon_selected==false && pomoblast_selected==false:
		get_node("No_Games_Selected_Popup_Alert").popup()
	elif method_selection_optionbutton.get_selected_id()==0:
		get_node("No_Selection_Method_Choosen_Popup_Alert").popup()
	elif deck_selection_optionbutton.get_selected_id()==0 && deck_selection_optionbutton.disabled == false:
		get_node("No_Deck_Selected_Popup_Alert").popup()
	elif category_selection_optionbutton.get_selected_id()==0 && category_selection_optionbutton.disabled == false:
		get_node("No_Category_Selected_Popup_Alert").popup()
	elif timer_selection_optionbutton.get_selected_id()==0:
		get_node("No_Time_Selected_Popup_Alert").popup()
	elif pomoblast_selected==true && game_selection_array[0]=="Pomoblast":
		get_tree().change_scene('res://PomoBlast/PomoBlast.tscn')	
	elif dungeon_selected==true && game_selection_array[0]=="Dungeon Fight":
		get_tree().change_scene('res://dungeon_fight/dungeon_fight.tscn')
####################################################################################################

####################################################################################################
#DETAILS BUTTONS
####################################################################################################
#Button Click for Dungeon_Fight Details
func _on_dungeon_fight_Details_Button_pressed():
	game_detail_label.text = ondungeonDetails()

#Button Click for Pomoblast Details
func _on_Pomoblast_Details_Button_pressed():
	game_detail_label.text = pomoblastDetails()
#Text for Dungeon_Fight Details
func ondungeonDetails():
	var text ="Title: Dungeon Fight \n\nCreated By: Noah Stinson\n\nDescription: Fight your way out of the dungeon and to success!\n\nControls: Mouse Clicks\n\nObjective: Answer as many questions correct as you can before time runs out. If you answer incorrectly or not in time you will take damage each time, eventually getting KO'ed"
	return text

#Text for PomoBlast Details
func pomoblastDetails():
	var text ="Title: PomoBlast \n\nCreated By: Eliss Glasper\n\nDescription: Fight your way through the pomogranates before they destroy YOU and your CREW!\n\nControls: Mouse Clicks - To Fire\nArrow Keys - To Move\n\nObjective: Destroy as many enemies as you can before!!"
	return text
####################################################################################################

####################################################################################################
#TOGGLE BUTTONS FOR GAMES
####################################################################################################
#Dungeon Fight Toggler
func _on_dungeon_fight_Selection_Toggle_toggled(button_pressed):
	#Dungeon Selector Clicked
	if(button_pressed):
		#Text for Toggle On Dungeon
		game_selection_array.append("Dungeon Fight")
		print(game_selection_array)
		game_selection_array=shuffle(game_selection_array)
		print(game_selection_array)
		dungeon_selected=true
		print("Dungeon_Selected:" + (String(dungeon_selected)))
		#$Game_Selection/VSplit_Game_Container/Games_Selection_Label.text=game_selection_array
	else:
		#Text for Toggle Off Dungeon
		game_selection_array.erase("Dungeon Fight")
		print(game_selection_array)
		game_selection_array=shuffle(game_selection_array)
		print(game_selection_array)
		dungeon_selected=false
		print("Dungeon_Selected:" + (String(dungeon_selected)))
		#$Game_Selection/VSplit_Game_Container/Games_Selection_Label.text=game_selection_array
#Pomoblast Toggler
func _on_Pomoblast_Selection_Toggle_toggled(button_pressed):
	if(button_pressed):
		#Text for Toggle On Pomoblast
		game_selection_array.append("Pomoblast")
		print(game_selection_array)
		game_selection_array=shuffle(game_selection_array)
		print(game_selection_array)
		pomoblast_selected=true
		print("Pomoblast_Selected:" + (String(pomoblast_selected)))
		#$Game_Selection/VSplit_Game_Container/Games_Selection_Label.text=game_selection_array
	else:
		#Text for Toggle Off Pomoblast
		game_selection_array.erase("Pomoblast")
		print(game_selection_array)
		game_selection_array=shuffle(game_selection_array)
		print(game_selection_array)
		pomoblast_selected=false
		print("Pomoblast_Selected:"+ (String(pomoblast_selected)))
		#$Game_Selection/VSplit_Game_Container/Games_Selection_Label.text=game_selection_array

#Function Shuffle Queue
#Reference:https://godotengine.org/qa/2547/how-to-randomize-a-list-array 
func shuffle(list):
	var shuffled_array=list.duplicate()
	shuffled_array.shuffle()
	return shuffled_array
####################################################################################################

####################################################################################################
#METHOD SELECTION BUTTON
####################################################################################################
#Selection Dropdown Items
func add_items_to_selection_method():
	#Options for Method Selection
	method_selection_optionbutton.add_item("Pick One")
	method_selection_optionbutton.add_item("Category")
	method_selection_optionbutton.add_item("Decks")
	method_selection_optionbutton.set_item_disabled(0,true)
#Deck Dropdown Items
func add_items_to_deck_selection():
	deck_selection_optionbutton.add_item("Pick One")
	deck_selection_optionbutton.add_item("Test 1")
	deck_selection_optionbutton.add_item("Test 2")
	deck_selection_optionbutton.add_item("Test 3")
	deck_selection_optionbutton.add_item("Test 4")
	deck_selection_optionbutton.set_item_disabled(0,true)
#Category Dropdown Items
func add_items_to_category_selection():
	category_selection_optionbutton.add_item("Pick One")
	category_selection_optionbutton.add_item("Test 1")
	category_selection_optionbutton.add_item("Test 2")
	category_selection_optionbutton.add_item("Test 3")
	category_selection_optionbutton.add_item("Test 4")
	category_selection_optionbutton.set_item_disabled(0,true)
#Timer Dropdown Items
func add_items_to_timer_selection():
	timer_selection_optionbutton.add_item("Select One")
	timer_selection_optionbutton.add_item("30")
	timer_selection_optionbutton.add_item("60")
	timer_selection_optionbutton.add_item("90")

#Checks which method is selected
func on_item_selected(id):
	if method_selection_optionbutton.get_item_id(id)==1:
		print(str(method_selection_optionbutton.get_item_text(id)))
		disable_deck_selection_option()
		category_selection_optionbutton.disabled=false
		category_selection_optionbutton.clear()
		add_items_to_category_selection()
	elif method_selection_optionbutton.get_item_id(id)==2:
		print(str(method_selection_optionbutton.get_item_text(id)))
		disable_category_selection_option()
		deck_selection_optionbutton.disabled=false
		deck_selection_optionbutton.clear()
		add_items_to_deck_selection()
#Returns to Original State
func disable_category_selection_option():
	category_selection_optionbutton.disabled=true
	category_selection_optionbutton.clear()
	category_selection_optionbutton.add_item("Disabled")
	category_selection_optionbutton.select(0)
	
func disable_deck_selection_option():
	deck_selection_optionbutton.disabled=true
	deck_selection_optionbutton.clear()
	deck_selection_optionbutton.add_item("Disabled")
	deck_selection_optionbutton.select(0)
	

####################################################################################################
###########################DDDDEEEEEEEEELLLLLLLLLLEEEEEEEEEEEEEEEETTTTTTTTTTEEEEEEEEEEEEEE##########
####################################################################################################

####################################################################################################
