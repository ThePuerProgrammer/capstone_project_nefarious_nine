extends Area2D

export var speed = 1000


func _physics_process(delta):
	position += transform.x * speed * delta



	


func _on_VisibilityNotifier2D_screen_exited():
	print("-------- Bullets are outie(dequeued) ") # Replace with function body.
	queue_free()



	




