extends Particles2D

func _on_MouseBubblesParticle_hide():
	print("removing bubble from scene")
	queue_free() # remove from scene when finished playing
