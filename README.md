# EOT-test-task

[Поиграть](https://maksibi.github.io/EOT-test-task/)

В разработке использовал Cursor IDE с подключением по MCP-Cocos-Server. Заложил код-стайл и ориентиры в [Collectable.ts](https://github.com/Maksibi/EOT-test-task/blob/main/assets/Scripts/Fruits/Collectable.ts).

Сразу стоит оговорить, что Collectable изначально планировался как абстрактный родительский класс, от которого могли бы унаследоваться GoodCollectableObject и BadCollectableObject, но для экономии времени и в виду небольшого объема кода плохие и хорошие объекты являются экземплярами Collectable.

Аудиоменеджер может расширяться в дальнейшем. 

Каждая фича разрабатывалась по отдельности и доводилась до финала. 
Подход старался использовать тот же, что и при разработке на Unity, однако TS и Cocos имеют свои ограничения и отличия, поэтому ИИ также работал в режиме Ask.

[Prompts.md](./Prompts.md)
