using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class Targetting : MonoBehaviour {
	public List<Transform> targets;
	public Transform seletedTarget;
	
	
	private Transform myTransform;
	
	// Use this for initialization
	void Start () 
	{
		targets=new List<Transform>();
		seletedTarget=null;
		myTransform=transform;
		
		AddAllEnemies();
	}
	
	void Updata()
	{
		AddAllEnemies();
	}
	public void AddAllEnemies()
	{
		GameObject[] go=GameObject.FindGameObjectsWithTag("Enemy");
		
		foreach(GameObject enemy in go)
			AddTarget(enemy.transform);
	}
	
	public void AddTarget(Transform enemy)
	{
		targets.Add(enemy);
	}
	
	private void SorTargetsByDistance()
	{
		targets.Sort(delegate(Transform t1,Transform t2)
		{
			return Vector3.Distance(t1.position,myTransform.position).CompareTo(Vector3.Distance(t2.position,myTransform.position));
		});
	}
	
	private void TargetEnemy()
	{
		if(seletedTarget==null)
		{
			SorTargetsByDistance();
		    seletedTarget=targets[0];
		}
		else
		{
			int index=targets.IndexOf(seletedTarget);
			
			if(index<targets.Count-1)
			{
			    index++;	
			}
			else
			{
				index=0;
			}
			DeselectTarget();
			seletedTarget=targets[index];	
		}
		SeleTarget();
	}
	
	private void SeleTarget()
	{
		//seletedTarget.renderer.material.color=Color.red;
		PlayerAttack pa=(PlayerAttack)GetComponent("PlayerAttack");
		pa.target=seletedTarget.gameObject;
	}
	
	private void DeselectTarget()
	{
		//seletedTarget.renderer.material.color=Color.blue;
		seletedTarget=null;
	}
	
	// Update is called once per frame
	void Update () 
	{
		if(Input.GetKeyDown(KeyCode.Tab))
		{
		    TargetEnemy();
		}
	}
}
