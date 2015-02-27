using UnityEngine;
using System.Collections;

public class Magic : MonoBehaviour {
	void  OnCollisionEnter(Collision theCollision )
	{
		if(theCollision.gameObject.tag == "Enemy")
		{
			Destroy(gameObject);
		}
		
	}
	void Update()
	{
		Destroy(gameObject,1);
	}
}
