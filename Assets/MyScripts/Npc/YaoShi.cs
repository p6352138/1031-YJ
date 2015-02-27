using UnityEngine;
using System.Collections;

public class YaoShi : MonoBehaviour {
	public GameObject myGUI = null;
	public GameObject Target;
	public GameObject ScreenPoint;
	void Start()
	{
		Target = GameObject.FindGameObjectWithTag("Player");
	}
	
	void Update()
	{
		
	}
	
	public void OnMouseUp()
	{
		if(Target==null)
			return;
		
		 if(Vector3.Distance(transform.position,Target.transform.position) < 5f)
		 {
			if(myGUI != null)
			{
			    myGUI.SendMessage("PropList",4);
				myGUI.SendMessage("DisplayShop",3);
		    } 
		}
	}
}
