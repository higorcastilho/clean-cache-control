import { LocalSavePurchases } from './local-save-purchases'
import { mockPurchases, CacheStoreSpy } from '../../tests'

type SutTypes = {
	sut: LocalSavePurchases
	cacheStore: CacheStoreSpy
}

const makeSut = ():SutTypes => {
	const cacheStore = new CacheStoreSpy()
	const sut = new LocalSavePurchases(cacheStore)
	return {
		sut,
		cacheStore
	}
}

describe('LocalSavePurchases', () => {
	test('Should not delete or insert cache on sut.init', () => {
		const { cacheStore }= makeSut()
		new LocalSavePurchases(cacheStore)
		expect(cacheStore.messages).toEqual([])
	})

	test('Should delete old cache on sut.save', async () => {
		const { sut, cacheStore } = makeSut()
		await sut.save(mockPurchases())
		expect(cacheStore.messages).toEqual([CacheStoreSpy.Message.delete, CacheStoreSpy.Message.insert])
		expect(cacheStore.deleteKey).toBe('purchases')
	})

	test('Should call delete with correct key', async () => {
		const { sut, cacheStore } = makeSut()
		await sut.save(mockPurchases())
		expect(cacheStore.deleteKey).toBe('purchases')
	})

	test('Should not insert new cach if delete fails', () => {
		const { sut, cacheStore } = makeSut()
		cacheStore.simulateDeleteError()
		const promise = sut.save(mockPurchases())
		expect(cacheStore.messages).toEqual([CacheStoreSpy.Message.delete])
		expect(promise).rejects.toThrow()
	})

	test('Should insert new cach if delete succeeds', async () => {
		const { sut, cacheStore } = makeSut()
		const purchases = mockPurchases()
		await sut.save(purchases)
		expect(cacheStore.messages).toEqual([CacheStoreSpy.Message.delete, CacheStoreSpy.Message.insert])
		expect(cacheStore.insertKey).toBe('purchases')
		expect(cacheStore.insertValues).toEqual(purchases)
	})

	test('Should throw if insert throws', async () => {
		const { sut, cacheStore } = makeSut()
		cacheStore.simulateInsertError()
		const promise = sut.save(mockPurchases())
		expect(cacheStore.messages).toEqual([CacheStoreSpy.Message.delete, CacheStoreSpy.Message.insert])
		expect(promise).rejects.toThrow()
	})
})