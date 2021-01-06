import { LocalSavePurchases } from './local-save-purchases'
import { mockPurchases, CacheStoreSpy } from '../../tests'

type SutTypes = {
	sut: LocalSavePurchases
	cacheStore: CacheStoreSpy
}

const makeSut = (timestamp = new Date()):SutTypes => {
	const cacheStore = new CacheStoreSpy()
	const sut = new LocalSavePurchases(cacheStore, timestamp)
	return {
		sut,
		cacheStore
	}
}

describe('LocalSavePurchases', () => {
	test('Should not delete or insert cache on sut.init', () => {
		const { cacheStore }= makeSut()
		expect(cacheStore.messages).toEqual([])
	})

	test('Should call delete with correct key', async () => {
		const { sut, cacheStore } = makeSut()
		await sut.save(mockPurchases())
		expect(cacheStore.deleteKey).toBe('purchases')
	})

	test('Should not insert new cach if delete fails', async () => {
		const { sut, cacheStore } = makeSut()
		cacheStore.simulateDeleteError()
		const promise = sut.save(mockPurchases())
		expect(cacheStore.messages).toEqual([CacheStoreSpy.Message.delete])
		await expect(promise).rejects.toThrow()
	})

	test('Should insert new cach if delete succeeds', async () => {
		const timestamp = new Date()
		const { sut, cacheStore } = makeSut(timestamp)
		const purchases = mockPurchases()
		const promise = sut.save(purchases)
		expect(cacheStore.messages).toEqual([CacheStoreSpy.Message.delete, CacheStoreSpy.Message.insert])
		expect(cacheStore.deleteKey).toBe('purchases')
		expect(cacheStore.insertKey).toBe('purchases')
		expect(cacheStore.insertValues).toEqual({
			timestamp,
			value: purchases
		})
		await expect(promise).resolves.toBeFalsy()
	})

	test('Should throw if insert throws', async () => {
		const { sut, cacheStore } = makeSut()
		cacheStore.simulateInsertError()
		const promise = sut.save(mockPurchases())
		expect(cacheStore.messages).toEqual([CacheStoreSpy.Message.delete, CacheStoreSpy.Message.insert])
		await expect(promise).rejects.toThrow()
	})
})