extends Control

#Buttons and Labels
onready var game_detail_label=$"Game_Selection/VSplit_Game_Container/Game_Details_Label"
onready var method_selection_optionbutton=$"Method_Selection_Button"
onready var deck_selection_optionbutton=$"Deck_Selection_Button"
onready var category_selection_optionbutton=$"Category_Selection_Button"
onready var timer_selection_optionbutton=$"Timer_Selection_Button"
onready var game_list_label=$"Game_Selection/VSplit_Game_Container/Games_Selection_Label"

#GAH-DOUGH-BALS
var game_selection_array = []
var dungeon_selected=false
var pomoblast_selected=false
var slowfruit_selected=false
var pomobite_selected
var desired_time
var category_selected
var deck_selected
var deckList

#Dictionaries
var dic_val_categories : Dictionary = {}
var dic_deck_name : Dictionary = {} #(-_-)#

func _ready():
	$FadeIn.show()
	$FadeIn.fade_in()
	if game_selection_array.empty()==true: 
		#Button Disabled
		disable_category_selection_option()
		disable_deck_selection_option()

		#Needed Items From The Start
		add_items_to_selection_method()
		add_items_to_timer_selection()
		method_selection_optionbutton.connect("item_selected",self,"on_method_item_selected")
		timer_selection_optionbutton.connect("item_selected",self,"on_timer_item_selected")
		category_selection_optionbutton.connect("item_selected",self,"on_category_item_selected")
		deck_selection_optionbutton.connect("item_selected",self,"on_deck_item_selected")
	else:
		game_selection_array.remove(0)
		_on_Start_Button_pressed()

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
	if !dungeon_selected and !pomoblast_selected and !pomobite_selected and !slowfruit_selected:
		get_node("No_Games_Selected_Popup_Alert").popup()
	elif method_selection_optionbutton.get_selected_id()==0:
		get_node("No_Selection_Method_Choosen_Popup_Alert").popup()
	elif deck_selection_optionbutton.get_selected_id()==0 and deck_selection_optionbutton.disabled == false:
		get_node("No_Deck_Selected_Popup_Alert").popup()
	elif category_selection_optionbutton.get_selected_id()==0 and category_selection_optionbutton.disabled == false:
		get_node("No_Category_Selected_Popup_Alert").popup()
	elif timer_selection_optionbutton.get_selected_id()==0:
		get_node("No_Time_Selected_Popup_Alert").popup()
	elif slowfruit_selected==true and game_selection_array[0]=="Slowfruit":
		Pomotimer.start_game(int(desired_time),game_selection_array,deck_or_cate())
	elif pomoblast_selected==true and game_selection_array[0]=="Pomoblast":
		Pomotimer.start_game(int(desired_time),game_selection_array,deck_or_cate())
	elif dungeon_selected==true and game_selection_array[0]=="Dungeon Fight":
		Pomotimer.start_game(int(desired_time),game_selection_array,deck_or_cate())
	elif pomobite_selected == true and game_selection_array[0] == "PomoBITE":
		Pomotimer.start_game(int(desired_time),game_selection_array,deck_or_cate())
	elif game_selection_array.empty():
		Pomotimer.start_game(int(desired_time),game_selection_array,deck_or_cate())
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

#Button Click for SlowFruit Details
func _on_Slowfruit_Details_Button_pressed():
	game_detail_label.text = slowfruitDetails()
	
#Button Click for PomoBITE Details	
func _on_PomoBITE_Details_Button_pressed():
	game_detail_label.text = pomoBITEDetails()
	
#Text for Dungeon_Fight Details
func ondungeonDetails():
	var text ="Title: Dungeon Fight \n\nCreated By: Noah Stinson\n\nDescription: Fight your way out of the dungeon and to success!\n\nControls: \n - [a] Select the Dodge Action\n - [d] Select the Attack Action \n - [LMB] Selecting answers\n\nObjective: Answer as many questions correct as you can before time runs out. If you answer incorrectly or not in time you will take damage each time, eventually getting KO'ed"
	return text

#Text for PomoBlast Details
func pomoblastDetails():
	var text ="Title: PomoBlast \n\nCreated By: Eliss Glasper\n\nDescription: Fight your way through the pomogranates before they destroy YOU and your CREW!\n\nControls: Mouse Clicks - To Fire\nArrow Keys - To Move\n\nObjective: Destroy as many enemies as you can before!!"
	return text
	
#Text for Slowfruit Details
func slowfruitDetails():
	var text ="Title: Slowfruit \n\nCreated By: Susan Emberton\n\nDescription: Help Boogie Dog catch the fruit and blast off! Watch out for the slowfruit.\n\nControls: Space or UP to Jump\nArrow Keys - To Move\n\nObjective: Eat the best fruit by choosing the correct answer"
	return text
	
func pomoBITEDetails():
	var text ="Title: PomoBITE \n\nCreated By: Jesse Rankins\n\nDescription: Take care of your guests in the PomoBITE restaurant and earn Pomocoins!\n\nControls: E - To Select/Use\nArrow Keys + WASD - To Move\n\nObjective: Remember your guests orders and move quick!"
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
		game_selection_array=shuffle(game_selection_array)
		dungeon_selected=true
		update_game_label(game_selection_array)

	else:
		#Text for Toggle Off Dungeon
		game_selection_array.erase("Dungeon Fight")
		game_selection_array=shuffle(game_selection_array)
		dungeon_selected=false
		update_game_label(game_selection_array)

#Pomoblast Toggler
func _on_Pomoblast_Selection_Toggle_toggled(button_pressed):
	if(button_pressed):
		#Text for Toggle On Pomoblast
		game_selection_array.append("Pomoblast")
		game_selection_array=shuffle(game_selection_array)
		pomoblast_selected=true
		update_game_label(game_selection_array)

	else:
		#Text for Toggle Off Pomoblast
		game_selection_array.erase("Pomoblast")
		game_selection_array=shuffle(game_selection_array)
		pomoblast_selected=false
		update_game_label(game_selection_array)

#Slowfruit Toggler
func _on_Slowfruit_Selection_Toggle_toggled(button_pressed):
	if(button_pressed):
		#Text for Toggle On Pomoblast
		game_selection_array.append("Slowfruit")
		game_selection_array=shuffle(game_selection_array)
		slowfruit_selected=true
		update_game_label(game_selection_array)

	else:
		#Text for Toggle Off Pomoblast
		game_selection_array.erase("Slowfruit")
		game_selection_array=shuffle(game_selection_array)
		slowfruit_selected=false
		update_game_label(game_selection_array)

#PomoBITE Toggler
func _on_PomoBITE_Selection_Toggle_toggled(button_pressed):
	if(button_pressed):
		#Text for Toggle On Pomoblast
		game_selection_array.append("PomoBITE")
		game_selection_array=shuffle(game_selection_array)
		pomobite_selected = true
		update_game_label(game_selection_array)

	else:
		#Text for Toggle Off Pomoblast
		game_selection_array.erase("PomoBITE")
		game_selection_array=shuffle(game_selection_array)
		pomobite_selected=false
		update_game_label(game_selection_array)
####################################################################################################

####################################################################################################
#METHOD SELECTION BUTTON
####################################################################################################
#Selection Dropdown Items
##########################
func add_items_to_selection_method():
	#Options for Method Selection
	method_selection_optionbutton.add_item("Pick One")
	method_selection_optionbutton.add_item("Category")
	method_selection_optionbutton.add_item("Decks")
	method_selection_optionbutton.set_item_disabled(0,true)

#Deck Dropdown Items
func add_items_to_deck_selection():
	#Retrieves Decks from Firestore User-Owned Decks
	deckList = FirebaseController.get_user_decks(CurrentUser.user_id)
	if deckList is GDScriptFunctionState:
		deckList = yield(deckList, "completed")
#Populates to a dictionary
	for deck in deckList:
		var fields = deck["doc_fields"]
		dic_deck_name[deck["doc_name"]] = fields["name"]
		print("DIC:",dic_deck_name[deck["doc_name"]])
	
	print("\nDECK DIC:",dic_deck_name,"\n")
	
#Adds Selections
	deck_selection_optionbutton.add_item("Pick One")
	for deck in dic_deck_name.values():
		deck_selection_optionbutton.add_item(deck)
	deck_selection_optionbutton.add_item("DEMO")
	deck_selection_optionbutton.set_item_disabled(0,true)

#Category Dropdown Items
func add_items_to_category_selection():
	#Retrieves Categories from Firestore Backend-collection
	var categories = FirebaseController.get_categories()
	if categories is GDScriptFunctionState:
		categories = yield(categories, "completed")
	
	#This retrieves the doc_fields values into an array, making it a double array
	#This works trying something else
	var dic_val_array = Array(categories["doc_fields"].values())
	#Value Below Prints Misc to Console, [0][i] to see all categories
	print(dic_val_array[0])

	#Adding Selections
	category_selection_optionbutton.add_item("Pick One")
	for category in dic_val_array[0]:
		dic_val_categories[category] = category 
		category_selection_optionbutton.add_item(category)
	category_selection_optionbutton.add_item("DEMO")	
	category_selection_optionbutton.set_item_disabled(0,true)

#Timer Dropdown Items
func add_items_to_timer_selection():
	timer_selection_optionbutton.add_item("Select One")
	timer_selection_optionbutton.add_item("30")
	timer_selection_optionbutton.add_item("60")
	timer_selection_optionbutton.add_item("90")
	timer_selection_optionbutton.add_item("10")
##########################
#On Selection
##########################
#Checks which method is selected
func on_method_item_selected(id):
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

#Checks which Time has been selected
#and assigns to a gah-dough-bal variable desired_time
func on_timer_item_selected(id):
	match timer_selection_optionbutton.get_item_id(id):
		id:
			desired_time=timer_selection_optionbutton.get_item_text(id)

#Checks which Category has been selected
#and assigns to a gah-dough-bal variable category_selected
func on_category_item_selected(id):
	match category_selection_optionbutton.get_item_id(id):
		id:
			category_selected=category_selection_optionbutton.get_item_text(id)
			print("Category Selected:",category_selected)

#Checks which Deck has been selected
#and assigns to a gah-dough-bal variable deck_selected
func on_deck_item_selected(id):
	match deck_selection_optionbutton.get_item_id(id):
		id:
			deck_selected=deck_selection_optionbutton.get_item_text(id)
			print("Deck Selected:",deck_selected)
##########################
#Disables Selection Options
##########################
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
##########################
#Other Useful Functions
##########################
#Function Shuffle Queue
#Reference:https://godotengine.org/qa/2547/how-to-randomize-a-list-array 
func shuffle(list):
	var shuffled_array=list.duplicate()
	shuffled_array.shuffle()
	return shuffled_array

#Updates the Game(s) Label with the Selection Array	
func update_game_label(game_selection_array):
	game_list_label.text = ("Game(s): \n" + str(game_selection_array))
	
#Returns what the selected value to the start_game
func deck_or_cate():
	if deck_selected != null:
		return deck_selected
	elif category_selected != null:
		return category_selected
####################################################################################################
