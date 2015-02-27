using UnityEngine;
using System.Collections;
using System.Collections.Generic;
public class TieJiang : MonoBehaviour 
{
	public GameObject myGUI = null;
	public Transform target; 
	
	void Start()
	{
		target = GameObject.FindGameObjectWithTag("Player").transform;
	}
	
	void Update()
	{
		if(target==null)
			return;
	}
	
	public void OnMouseUp()
	{
		if(Vector3.Distance(transform.position,target.transform.position) < 5f)
		{
			if(myGUI != null)
			{
			    myGUI.SendMessage("PropList",1);
				myGUI.SendMessage("DisplayShop",1);
		    }
		}
	}
}
