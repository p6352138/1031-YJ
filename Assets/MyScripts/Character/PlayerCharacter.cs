using UnityEngine;
using System.Collections;
using System.Collections.Generic;
public class PlayerCharacter : BaseCharacter 
{
	private static List<Item> _inventory = new List<Item>();
	private static List<Item> _equipment = new List<Item>();
	private static Item _equipedWeapon;
	
	public static List<Item> Inventory
	{
		get{return _inventory;}
	}
	
	public static List<Item> Equipment
	{
		get{return _equipment;}
	}
	
	public static Item EquipedWeapon
	{
		get{return _equipedWeapon; }
		set{_equipedWeapon = value; }
	}
	
		
}
