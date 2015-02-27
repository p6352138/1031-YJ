using UnityEngine;

public static class ItemGenerator{
	public const int BASE_MELEE_RANGE = 1;
	public const int BASE_RANGED_RANGE = 5;
	
	private const string WEAPON_PATH = "ItemIcons/";
	
	public static Item CreateItem(int i) {
		//decide what type of item to make
		//call the method to create that base item type
		Item item = CreateWeapon(i);
		item.Value = Random.Range(1,101);
		item.Rarity = RarityTypes.common;
		
		item.MaxDurability = Random.Range(50,61);
		item.CurDurability = item.MaxDurability;
		
		//return the new Item
		return item;
	}
	
	private static Weapon CreateWeapon(int i) {
		//decid if we make a melee or ranged weapon
		Weapon weapon = CreateMeleeWeapon(i);
		
		//return the weapon created
		return weapon;
	}
	
	private static Weapon CreateMeleeWeapon(int i) {
		Weapon meleeWeapon = new Weapon();
		
		string[] weaponNames = new string[]{"躹⽣","�ط潣","��ĺ��","躹Ⲽ��","�ط沼��",
			                                "躹�����","�ط�����","躹Ⲽ��","�ط沼��","躹Ⲽ��",
			                                "�ط沼Ь","躹⻤��","�ط滤��","������ָ","��������",
			                                "����ָ","�������","�о�ɢ","�ſ�"};
		
		//fill in all of values for that item type
		
		meleeWeapon.Name = weaponNames[i];

		//assign the max damage of weapon
		meleeWeapon.MaxDamage = Random.Range(5, 11);
		meleeWeapon.DamdgeVariance = Random.Range(.2f, .76f);
		meleeWeapon.TypeOfDamage = DamageType.Sword1;
		
		//assign the max range of this weapon
		meleeWeapon.MaxRange = BASE_MELEE_RANGE;
		
		//assign the icon for the weapon
		meleeWeapon.Icon = Resources.Load(WEAPON_PATH + meleeWeapon.Name) as Texture2D;
		
		//return the mell weapon
		return meleeWeapon;
	}
}

public enum ItemType{
	Armor,
	Weapon,
	Potion,
	Scroll
}