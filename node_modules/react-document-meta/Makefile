BIN   = ./node_modules/.bin
PATH := $(BIN):$(PATH)
LIB   = $(shell find lib -name "*.js")
DIST   = $(patsubst lib/%.js,dist/%.js,$(LIB))

install:
	@ npm $@

dist: $(DIST)
dist/%.js: lib/%.js
	@ mkdir -p $(@D)
	$(BIN)/babel $< -o $@

lint:
	@ echo "\nLinting source files, hang on..."
	@ yarn lint

test:
	@ echo "\nTesting source files, hang on..."
	@ yarn test

test-dist:
	@ echo "\nTesting build files, almost there..!"
	@ yarn test:dist

coveralls:
	@ cat ./coverage/lcov.info | $(BIN)/coveralls

clean:
	@ rm -rf ./dist
	@ rm -rf ./coverage

build: lint test clean dist test-dist
	@ git add . && \
		git commit -am "make build"

release: build
	@ npm publish

release-patch: build
	@ npm version patch

.PHONY: install dev test clean dist test-build build
