extends RigidBody2D

export (Texture) var foodPiece1
export (Texture) var foodPiece2
export (Texture) var foodPiece3

# Called when the node enters the scene tree for the first time.
func _ready():
	modulate.a = 1
		
	randomize()
	var randTexturePicker = floor(rand_range(0, 3))
	var randAngularVelocity = floor(rand_range(-35, 35))
	var initVelocityIntensity = 150
	var randLinearVelocity = Vector2( floor(rand_range(-initVelocityIntensity, -(initVelocityIntensity * 3 / 4))) , initVelocityIntensity / 2 )
	
	if randTexturePicker == 0:
		$FoodPieceSprite.texture = foodPiece1
	elif randTexturePicker == 1:
		$FoodPieceSprite.texture = foodPiece2
	elif randTexturePicker == 2:
		$FoodPieceSprite.texture = foodPiece3
	
	angular_velocity = randAngularVelocity
	linear_velocity = randLinearVelocity

func destroyFoodPiece():
	$AnimationPlayer.play("fade_out")


func _on_AnimationPlayer_animation_finished(anim_name):
	if anim_name == "fade_out":
		queue_free()
