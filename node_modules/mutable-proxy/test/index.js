import expect              from 'expect';
import Lab                 from 'lab';
import mutableProxyFactory from '../src/index';

const lab = exports.lab = Lab.script();
const { describe, it, beforeEach } = lab;

describe('mutableProxyFactory', () => {
  let proxy;
  let setTarget;
  let setHandler;
  let getTarget;
  let getHandler;

  beforeEach(done => {
    const controller = mutableProxyFactory();
    proxy = controller.proxy;
    setTarget = controller.setTarget;
    getTarget = controller.getTarget;
    setHandler = controller.setHandler;
    getHandler = controller.getHandler;
    done();
  });

  it('sets the passed in value as the initial target', done => {
    const target = {};
    expect(mutableProxyFactory(target).getTarget()).toEqual(target);
    done();
  });

  describe('setTarget', () => {
    it('should throw if passed a primitive', done => {
      try {
        setTarget(5);
      } catch (error) {
        expect(error).toBeTruthy();
      }
      done();
    });

    describe('proxy', () => {
      describe('when object set as target', () => {
        it('should be a plain object', done => {
          setTarget({ a: 'apple' });
          expect(Object.getPrototypeOf(proxy)).toEqual(Object.prototype);
          done();
        });
      });

      describe('when callable set as target', () => {
        it('should be a function', done => {
          setTarget(() => 5);
          expect(Object.getPrototypeOf(proxy)).toEqual(Function.prototype);
          done();
        });
      });

      describe('when array set as target', () => {
        it('should be an array', done => {
          setTarget([1, 2, 3]);
          expect(Object.getPrototypeOf(proxy)).toEqual(Array.prototype);
          done();
        });
      });

      describe('when object then callable set as target ', () => {
        beforeEach(done => {
          setTarget({ a: 'apple' });
          setTarget(() => 5);
          done();
        });

        it('should be a function', done => {
          expect(Object.getPrototypeOf(proxy)).toEqual(Function.prototype);
          done();
        });
      });

      describe('when object then array set as target ', () => {
        beforeEach(done => {
          setTarget({ a: 'apple' });
          setTarget([]);
          done();
        });

        it('should be an array', done => {
          expect(Object.getPrototypeOf(proxy)).toEqual(Array.prototype);
          done();
        });
      });

      describe('when callable then object set as target ', () => {
        beforeEach(done => {
          setTarget(() => 5);
          setTarget({ a: 'apple' });
          done();
        });

        it('should be a plain object', done => {
          expect(Object.getPrototypeOf(proxy)).toEqual(Object.prototype);
          done();
        });
      });

      describe('when callable then array set as target ', () => {
        beforeEach(done => {
          setTarget(() => 5);
          setTarget([]);
          done();
        });

        it('should be array', done => {
          expect(Object.getPrototypeOf(proxy)).toEqual(Array.prototype);
          done();
        });
      });

      describe('when array then object set as target ', () => {
        beforeEach(done => {
          setTarget([1, 2, 3]);
          setTarget({ a: 'apple' });
          done();
        });

        it('should be a plain object', done => {
          expect(Object.getPrototypeOf(proxy)).toEqual(Object.prototype);
          done();
        });
      });

      describe('when array then callable set as target ', () => {
        beforeEach(done => {
          setTarget([1, 2, 3]);
          setTarget(() => 5);
          done();
        });

        it('should be a function', done => {
          expect(Object.getPrototypeOf(proxy)).toEqual(Function.prototype);
          done();
        });
      });
    });
  });

  describe('setHandler', () => {
    it('should throw if passed an object with non-function fields', done => {
      try {
        setHandler({ a: 'apple' });
      } catch (error) {
        expect(error).toBeTruthy();
      }
      done();
    });

    it('should throw if passed an object with non-trap fields', done => {
      try {
        setHandler({ a: () => 5 });
      } catch (error) {
        expect(error).toBeTruthy();
      }
      done();
    });
  });

  describe('getHandler', () => {
    it('should return the current handler', done => {
      const handler = { get() {} };
      setHandler(handler);
      expect(getHandler()).toEqual(handler);
      done();
    });
  });

  describe('getTarget', () => {
    it('should return the current target', done => {
      const target = {};
      setTarget(target);
      expect(getTarget()).toEqual(target);
      done();
    });
  });
});
