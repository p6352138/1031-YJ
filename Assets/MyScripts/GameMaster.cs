using UnityEngine;
using System.Collections;

public class GameMaster : MonoBehaviour 
{

    public GameObject gameSettings;

	// Use this for initialization
	void Start () 
	{
		LoadCharacter();
	}
	
	public void LoadCharacter()
	{
		GameObject gs = GameObject.Find("__GameSettings");
		
		if(gs == null)
		{
			GameObject gs1 = Instantiate(gameSettings,Vector3.zero,Quaternion.identity) as GameObject;
			gs1.name = "__GameSettings";
		}
		GameSettings gsScript=GameObject.Find("__GameSettings").GetComponent<GameSettings>();
			
		//load the character data
		gsScript.LoadCharacterData();
	}
}
