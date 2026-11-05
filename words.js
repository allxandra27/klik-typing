// Слова для вправи «Мої слабкі клавіші». Лише малі літери.
// Вправа сама бере тільки ті слова, усі літери яких учень уже вивчив.
window.KLIK_WORDS = {
  ua: `
    є дає лає радіє ждала ждав фал фа пожар фарфор фора пора вода лава жало дід лід лад два папа пара рада рід рів дар жар пар вал лапа плов плід фара фіал
    віра ліра поділ відро відра вода дрова парад порада правда прапор провід папір пароплав відвар
    оля ірина двері ворота воля доля поле долар олово ділове рідне вода вправа права
    вірю вірно вода радо рано ліво право далі дало було
    рука нога око вухо щока гора нора кіно вікно жук пух дух лук круг рік кран парк хор двір урок
    перерва оцінка журнал горох огірок горіх цукор їжак вовк лелека орел крук дерево озеро голова
    паркан пенал екран кнопка клавіша файл папка кукурудза цукерка папуга шапка груша ворона корова
    клей дощ гарна нова холодна довга кругла рожева легка зелене холодне гарне нове легке дорога
    жолуді зерно перо гроно гілка шафа щука плащ кущ борщ щастя каша кіно пень нерв хвіст зоряна
    зоря зоопарк завод задача зошит газета завжди новина неділя небо ніч нитка кіт кішка курка качка
    цирк цегла птиця вулиця синиця сонце серце місяць олівець палець
    їжа їхати їсти мої твої свої країна україна поїзд поїхали їжачок
    єнот моє твоє своє знає дає має гарне йти йогурт йорж мій твій край гай чай майка зайчик
    мама тато сова сало мило ліс дім сом сіль стіл яма літо липа мова вата брат сад роса лампа торба
    салат тополя слива столи свято робота мавпа добро читати писати бачити робити стояти сидіти
    любити плавати дівчата малята світло сила оля біла стара свіжа чиста добра мала сива люба любі
    мить ти ми ви сім твір тінь день кінь сіль лось мідь сіть осінь весна зима вітер сніг мороз
    чай час чашка чобіт ключ меч обруч учень школа книжка читання вечір ранок обід ніч річка місто
    село собака сорока соняшник сестра батько мати бабуся дідусь дитина дочка син друг подруга клас
    стілець ліжко вікно підлога стеля кімната кухня ложка виделка тарілка хліб молоко сир масло мед
    яблуко вишня черешня банан диня кавун морква капуста картопля цибуля часник помідор
    білка заєць лисиця ведмідь миша кінь ягня теля кролик метелик бджола мурашка ластівка лебідь
    монітор клавіатура мишка принтер програма картинка інформатика навушники підручник ноутбук
    юшка юнак люди люблю малюю ключ юла сюди тюльпан бюро сім сімка сьогодні завтра вчора тиждень
    я моя твоя земля зоря буря яблуня ялинка якір ящірка яйце пісня бабця дякую
    ґава ґанок ґудзик ґрунт ґрати аґрус дзиґа ґедзь ґречний п'ять м'яч сім'я ім'я м'ята дев'ять пам'ять комп'ютер
    щасливий чудовий український черепаха шоколад щоденник черешня жовтий зелений синій червоний
    великий малий гарний смачний теплий цікавий швидкий повільний веселий розумний сміливий добрий
  `.trim().split(/\s+/),
  en: `
    a add all ask asks dad lads falls fad flask flasks flak fall flash glad had hall lad lag salad sad shall ask alas flask
    gas has half dash jazz     the to you are we they he she his her it is in on at of for with this that what who when where
    red top try you your pet tree road rain tea sea eat two toy quit quiet query queen quick quiz
    rat rate rope ship shop stop star start story street water winter write work world word week wet
    yes yellow year young play paper pencil people pink park pair part put pupil
    old open orange over out our one only off oil office
    idea ink ice it its if ill
    us use up under uncle
    fish frog fast fat far few find fine first five food foot friend fun flag fly
    good game girl green go get give great grey garden
    hat hot hand happy help here home horse house hello
    jam jump juice jacket jungle job jeans joke july june
    kite king kitten kangaroo milk key keep kind kid kick know
    lake lamp leg let like line lion little live long look love lunch
    desk door dog day dark did dinner do down draw dream drink
    see sit six sky small snow song soon sun swim school sister summer
    zoo zebra zero pizza puzzle size lazy crazy freeze
    box fox six taxi mix next text fix wax mixer
    cat car can cake cup cold come city clock class chair child computer
    van very vest visit voice village vegetable seven river ever love
    ball bag bed big bird black blue boat book boy bread brother bus but buy
    name near new nice night nine no nose not now number
    man map may me milk monday money month moon more morning mother mouse music my
  `.trim().split(/\s+/)
};
