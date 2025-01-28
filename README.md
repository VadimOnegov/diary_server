# Используемые библиотеки #
---
* Capistrano
* PM2
* Knex
# Деплой на сервер #
---
* Миграции
* Автостарт при перезагрузке сервера
* Вывод логов в консоль

Для корректного развертывания нужно ssh соединение с репозитарием.
Для этого генерим пару ключей (например в puttygen), потом идем на bitbucket.org в настройки аккаунта, выбираем там SSH keys и добавляем публичный ключ.

Для windows надо установить Ruby (https://rubyinstaller.org/).
Дальнейшие команды выполнять в каталоге сервера, команды gem и cap находятся в каталоге bin Ruby.

Локально установить gem

```
#!

gem install ruby capistrano capistrano-npm
```

Проверка правильности конфига

```
#!

cap production deploy:check
```

После перезагрузки сервера необходим запуск команды для старта pm2

```
#!

cap production deploy:first_install
```

Деплой

```
#!

cap production deploy
```

Вывести логи

```
#!

cap production deploy:logs
```

Создать резервную копию БД

```
#!

cap production deploy:backup
```







# Перебрать ↓ #
http://knexjs.org/
---

1) Установить CLI:
	
	npm install knex -g

2) Выполнение миграций:
	
	knex migrate:latest

3) Заполнение БД:
	
	knex seed:run users

4) API

	4.1) Авторизация (Получение токена)

		Url:
			auth/token (POST)

		Header:
			Content-Type: application/x-www-form-urlencoded

		Body:
			grant_type=password&username=user1&password=user1pwd

		Respond (токен):
			qx7wx49TaMAqz5Am1qCP

	4.2) Регистрация логина

		Url:
			auth/register (POST)

		Header:
			Content-Type: application/x-www-form-urlencoded

		Body:
			login=79196900000&clientid=clientDeviceId

		Respond:
			{ "code": "1962", "id": 28 }

	4.3) Подтверждение логина

		Url:
			auth/loginvalidation (POST)

		Header:
			Content-Type: application/x-www-form-urlencoded

		Body:
			id=28&code=1962

		Respond (токен):
			QqTgou5mEQ0Cgrg0ZZ98

	4.4) Авторизация по токену

		Authorization: bearer [токен]

		Header:
			Content-Type: application/json




1. Установить PostgreeSQL
2. Установить расширение PostgreeSQL PostGIS
3. Создать БД goodroad
4. В созданной БД добавить расширение PostGIS (через PGAdmin или командой CREATE EXTENSION postgis SCHEMA public VERSION "2.3.1")
5. создать пользователя с админскими правами, с именем goodroad и паролем goodroadpwd
6. В каталоге сервера выполнить команду knex migrate:latest (после этого в БД должны быть созданы таблицы)
7. Запустить сервер
8. Через команду ipconfig или ее аналог в apple узнать ip-адрес своего компьютера
9. В файле client\app\controllers\config.js строчку
	export const serverName = 'http://128.199.55.151';
поменять на
	export const serverName = 'http://свой ip-адрес:порт';
10. В файле server\routes\auth.js закомментировать строку:
	sendSms.sendSMS(phone, code);
11. Запустить клиента. Запросы отправляемые на сервер должны быть видны в консоли сервера.