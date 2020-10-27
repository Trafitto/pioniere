.PHONY: build
build:
	docker-compose -f ./docker-compose.yml down | echo -
	docker-compose -f ./docker-compose.yml build


.PHONY: up
up:
	docker-compose -f docker-compose.yml up --build