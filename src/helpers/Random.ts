export class Random {

	/**
	 * @private
	 * @static
	 * @param {number} a
	 * @return {*} 
	 * @memberof Random
	 * ---
	 * Mulberry32 is a simple generator with a 32-bit state 
	 * but is extremely fast and has good quality.
	 *
	 */
	private static Mulberry32(a: number): () => number {
		return () => {
			let t = a += 0x6D2B79F5;
			t = Math.imul(t ^ t >>> 15, t | 1);
			t ^= t + Math.imul(t ^ t >>> 7, t | 61);
			return ((t ^ t >>> 14) >>> 0) / 4294967296;
		};
	}

	/**
	 * @private
	 * @static
	 * @param {string} str
	 * @return {*}  {() => number}
	 * @memberof Random
	 * ---
	 * MurmurHash3 mixing funciton seed generator
	 */
	private static Xmur3(str: string): () => number {
		let h: number;
		for (let i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
			h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
			h = h << 13 | h >>> 19;
		return () => {
			h = Math.imul(h ^ h >>> 16, 2246822507);
			h = Math.imul(h ^ h >>> 13, 3266489909);
			return (h ^= h >>> 16) >>> 0;
		};
	}

	/**
	 * @static
	 * @return {*}  {number}
	 * @memberof Random
	 * ---
	 * This will return a number between 0 (inclusive) and 1 (exclusive)
	 */
	public static RandomNumber(): number {
		const seed = Random.Xmur3(Date.now().toString());
		const rand = Random.Mulberry32(seed());
		const result = rand();
		return result;
	}
}