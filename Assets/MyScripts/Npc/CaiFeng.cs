using UnityEngine;
using System.Collections;
using System.Collections.Generic;
public class CaiFeng : MonoBehaviour 
{
	public GameObject myGUI = null;
	public Transform target; 
	
	void Start()
	{
		target = GameObject.FindGameObjectWithTag("Player").transform;
	}
	
	void Update()
	{
		
	}
	
	public void OnMouseUp()
	{
		if(target==null)
			return;
		if(Vector3.Distance(transform.position,target.transform.position) < 5f)
		{
			if(myGUI != null)
			{
			    myGUI.SendMessage("PropList",2);
				myGUI.SendMessage("DisplayShop",2);
		    }
		}
	}
}
