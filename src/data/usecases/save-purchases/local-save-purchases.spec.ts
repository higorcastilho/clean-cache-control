import { CacheStore } from '../../protocols/cache'
import { LocalSavePurchases } from './local-save-purchases'

class CacheStoreSpy implements CacheStore {
	deleteCallsCount = 0
	insertCallsCount = 0
	key: string
	delete (key: string): void {
		this.deleteCallsCount++
		this.key = key
	}
}

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
	test('Should not delete cache on sut.init', () => {
		const { cacheStore }= makeSut()
		new LocalSavePurchases(cacheStore)
		expect(cacheStore.deleteCallsCount).toBe(0)
	})

	test('Should delete old cache on sut.save', async () => {
		const { sut, cacheStore } = makeSut()
		await sut.save()
		expect(cacheStore.deleteCallsCount).toBe(1)
	})

	test('Should call delete with correct key', async () => {
		const { sut, cacheStore } = makeSut()
		await sut.save()
		expect(cacheStore.key).toBe('purchases')
	})

	test('Should not insert new cach if delete fails', async () => {
		const { sut, cacheStore } = makeSut()
		jest.spyOn(cacheStore, 'delete').mockImplementationOnce(() => {throw new Error()})
		const promise = sut.save()
		expect(cacheStore.insertCallsCount).toBe(0)
		expect(promise).rejects.toThrow()
	})
})