using UnityEngine;
using System.Collections;

public class EnemyPrefab_fox : MonoBehaviour {
	public GameObject prefab;
	public GameObject tiger;
	private float attackTimer=1f;
	private bool enemy;
	public int cunt3 = 0;
	// Use this for initialization
	void Start () {
	}
	
	// Update is called once per frame
	void Update () {
		if(attackTimer>0)
			attackTimer-=Time.deltaTime;
		if(attackTimer<0)
			attackTimer=0;
		if(cunt3 < 5)
		{
			if(attackTimer==0)
		    {
			    tiger = Instantiate(prefab,gameObject.transform.position,gameObject.transform.rotation)as GameObject;
			    attackTimer=5f;
				cunt3++;
		    }
		}

	}
	
	void InstantEnemy()
	{
		
	}
	
}
