---
title: Rust学习
categories:
  - Rust
---

# Rust 关键点学习笔记（进阶版）

> **适用对象**：已预习基础语法、正在攻克所有权与抽象机制的 Rust 学员。  
> **使用方式**：每个关键点按“内容介绍 → 详细描述 → 代码示例 → 常见坑”组织。代码示例可直接放入 `main.rs` 运行。

---

## 模块 A：所有权系统的地基

### A1. 所有权与 Move

#### 内容介绍

所有权是 Rust 内存管理的核心规则集：每个值有唯一所有者；所有者离开作用域时值被 `drop`；所有权可以**移动（move）**，但移动后原变量不可再用。

#### 详细描述

- **栈与堆的分工**：大小固定的数据默认在栈上；大小未知或可变的数据在堆上，栈上只存指针。
- **Move 的本质**：对于非 `Copy` 类型（如 `String`、`Vec`），赋值或传参时堆数据的**所有权指针**被转移，原变量被编译器标记为“已移动”。
- **`Copy` 的例外**：所有字段都是 `Copy` 的类型可以标记 `#[derive(Copy, Clone)]`，赋值时按位复制，不触发移动。
- **`Clone` 不是 `Copy`**：`clone()` 是显式的深拷贝，适用于需要保留原值的场景。

#### 代码示例

```rust
#[derive(Debug)]
struct MyStruct { s: u32 }

fn main() {
    let x = MyStruct { s: 5 };
    let y = x;          // move：x 的所有权转移给 y
    // println!("{:?}", x); // ❌ 编译错误 E0382：x 已被移动
    println!("{:?}", y); // ✅ y 有效

    let a = 1_i32;
    let b = a;           // i32 是 Copy，a 仍然可用
    println!("{a} {b}"); // ✅

    let s1 = String::from("many");
    let s2 = s1.clone(); // 显式深拷贝
    println!("{s1} {s2}"); // ✅
}
```

#### 常见坑

- 把非 `Copy` 类型传给函数后继续使用原变量：报 **E0382 “use of moved value”**。
- 试图给含 `String` 字段的结构体加 `#[derive(Copy)]`：如果字段不是 `Copy`，编译失败。
- 在循环中反复 `clone()` 大对象：能借用就借用，`clone()` 是性能陷阱。

---

### A2. 引用与借用

#### 内容介绍

**引用（reference）** 是不获取所有权而访问值的方式；**借用（borrowing）** 是使用引用的行为。`&T` 是不可变借用，`&mut T` 是可变借用。

#### 详细描述

- **借用规则（核心）**：在任意时刻，对同一数据只能存在**一个可变引用**，**或任意多个不可变引用**，二者不能同时存在。
- **不可变借用默认只读**：通过 `&T` 不能修改数据，即使原变量是 `mut` 的。
- **可变借用需要 `&mut`**：创建 `&mut T` 要求原变量本身是 `mut` 的。
- **引用的作用域**：引用的有效范围不能超过被借用值的生命周期——这是编译器在函数签名层面检查的，日常编码中大多由借用规则隐式保证。
- **`Deref` 强制转换**：`&String` 可以自动强转为 `&str`，`&Vec<T>` 可以强转为 `&[T]`，这是很多 API 接受 `&str`/`&[T]` 的原因。

#### 代码示例

```rust
fn calculate_length(s: &String) -> usize {
    s.len()
} // s 离开作用域，但不拥有数据，所以不会 drop 原 String

fn main() {
    let s1 = String::from("hello");
    let len = calculate_length(&s1); // 借用，s1 仍然拥有所有权
    println!("The length of '{}' is {}.", s1, len); // ✅

    let mut s = String::from("hello");
    // let r1 = &s;
    // let r2 = &mut s; // ❌ 不可变借用与可变借用不能共存
    // println!("{r1}");

    let r3 = &mut s;
    r3.push_str(", world"); // ✅ 可变借用
    println!("{s}");         // ✅ r3 的借用在此前结束
}
```

#### 常见坑

- **同时持有不可变和可变引用**：报错“cannot borrow as mutable because it is also borrowed as immutable”。
- **在 `struct` 中存引用**：需要显式生命周期标注，这是后续智能指针要解决的场景之一。
- 误以为 `&mut T` 只是“可变的别名”：它同时意味着**排他性访问**，这是 Rust 并发安全的基础。

---

### A3. 切片

#### 内容介绍

切片（slice）是对**连续序列的一部分**的借用视图，类型为 `&[T]` 或 `&mut [T]`。它本身是一个“双字对象”：一个指针 + 一个长度。

#### 详细描述

- **切片的长度在运行时已知，不在类型中编码**：`[T; N]` 的长度 `N` 是类型的一部分；`&[T]` 的长度是值的一部分。
- **切片不拥有数据**：它借用数组、`Vec`、`String` 等底层连续存储的一部分。
- **范围语法**：`&arr[1..4]` 借用索引 1、2、3 的元素；`..` 表示全体，`..n` 表示从头到 n（不含），`n..` 表示从 n 到尾。
- **`&str` 是字节切片**：`&str` 本质上是对 UTF-8 字节序列的切片，这也是字符串与切片之间的桥梁。

#### 代码示例

```rust
fn analyze_slice(slice: &[i32]) {
    println!("第一个元素：{}，长度：{}", slice[0], slice.len());
}

fn main() {
    let xs: [i32; 5] = [1, 2, 3, 4, 5];
    analyze_slice(&xs);        // 整个数组借用为切片
    analyze_slice(&xs[1..4]);  // 借用部分：2, 3, 4

    let v = vec![10, 20, 30, 40];
    let mid = &v[1..3];        // Vec 也可以切片
    println!("{:?}", mid);     // [20, 30]

    let s = String::from("hello");
    let hello = &s[..];        // &str，借用整个 String
    let ell = &s[1..4];        // "ell"
    println!("{hello} {ell}");
}
```

#### 常见坑

- **越界索引**：`xs[10]` 在编译期可知越界时直接编译失败；运行时越界会 panic。安全替代是 `.get(i)` 返回 `Option`。
- **对 `String` 按字节切片可能切在 UTF-8 字符中间**：`&s[0..1]` 如果 `s` 含多字节字符会 panic。对文本应使用 `.chars()` 或 `char_indices()`。
- 切片借用期间不能修改底层容器：借用规则同样适用。

---

## 模块 B：日常数据类型

### B1. 字符串：String / &str / str

#### 内容介绍

Rust 字符串的核心区分：**`String` 是拥有所有权、可增长、堆分配的 UTF-8 缓冲区**；**`&str` 是借用的 UTF-8 字符串切片**；**`str` 是未定长的底层类型，通常只以 `&str` 形式出现**。

#### 详细描述

| 类型 | 所有权 | 可增长 | 存储 | 典型来源 |
|---|---|---|---|---|
| `String` | 拥有 | ✅ | 堆 | `String::from`、`to_string()`、`format!` |
| `&str` | 借用 | ❌ | 指向别处 | 字符串字面量、`&String` 切片 |
| `str` | — | — | 未定长 | 只能通过 `&str` 使用 |

- **字符串字面量是 `&'static str`**：编译期就存在于二进制中，生命周期是整个程序。
- **`&String` 可自动强转为 `&str`**：因为 `String` 实现了 `Deref<Target = str>`。函数参数应优先写 `&str`，这样同时接受 `&String` 和字面量。
- **`String` 的修改**：`push_str`、`push`、`+`、`format!`；索引**不能**直接用 `s[0]`（UTF-8 字节索引），应使用切片或字符迭代器。

#### 代码示例

```rust
fn takes_slice(slice: &str) {
    println!("Got: {slice}");
}

fn main() {
    let literal: &'static str = "Hello";       // &str
    let mut owned: String = literal.to_string(); // String
    owned.push_str(", world");

    takes_slice(literal);   // &str 直接传入
    takes_slice(&owned);    // &String 自动强转为 &str

    // 拼接
    let s1 = String::from("foo");
    let s2 = String::from("bar");
    let s3 = s1 + &s2;      // s1 被 move，s2 被借用
    println!("{s3}");        // foobar

    // 按字符遍历，避免字节切片 panic
    for c in "héllo".chars() {
        print!("{c} ");
    }
}
```

#### 常见坑

- **`&String` 和 `&str` 在函数签名中混用**：参数尽量用 `&str`，返回值根据所有权需求选择 `String` 或 `&str`。
- **对 `String` 用 `[0]` 索引**：编译错误，因为 `String` 没有实现 `Index<usize>`。用 `.as_bytes()[0]` 或 `.chars().next()`。
- **`+` 会 move 左侧操作数**：`s1 + &s2` 之后 `s1` 不可再用；需要保留时用 `format!` 或 `clone()`。

---

### B2. 数组与切片辨析

#### 内容介绍

数组 `[T; N]` 的长度是**类型的一部分**，在编译期确定，通常栈分配；切片 `&[T]` 是**借用视图**，长度运行时确定，双字对象。

#### 详细描述

- **数组**：适合长度固定、对性能敏感的场景；赋值时如果是 `Copy` 元素类型则按位复制，否则 move。
- **切片**：适合作为函数参数接收“任意长度的连续序列”；`&[T]` 是数组和 `Vec<T>` 的公共接口。
- **`&[T]` 与 `&Vec<T>`**：函数参数写 `&[T]` 更通用，因为 `&Vec<T>` 可以自动强转为 `&[T]`。
- **`Vec<T>` 是堆上的可增长数组**：本质是“指针 + 长度 + 容量”，可以借用为 `&[T]`。

#### 代码示例

```rust
fn sum(values: &[i32]) -> i32 {
    values.iter().sum()
}

fn main() {
    let arr: [i32; 4] = [1, 2, 3, 4];
    let v: Vec<i32> = vec![5, 6, 7];

    println!("{}", sum(&arr)); // 数组借用为切片
    println!("{}", sum(&v));   // Vec 借用为切片
}
```

#### 常见坑

- 试图把数组直接当作动态长度容器使用：数组长度固定，需要动态增删时用 `Vec`。
- 函数签名写 `&Vec<T>`：限制了只能接受 `Vec`，应优先写 `&[T]`。

---

## 模块 C：抽象与错误处理

### C1. 泛型

#### 内容介绍

泛型允许函数、结构体、枚举对“任意类型”编写一次代码；但**泛型函数体内只能使用对所有类型都有效的操作**，需要更具体的能力时必须加 **trait bound**。

#### 详细描述

- **泛型参数声明**：`fn foo<T>(x: T) -> T`；结构体 `struct Point<T> { x: T, y: T }`。
- **trait bound**：`fn largest<T: PartialOrd>(list: &[T]) -> &T`。没有 `PartialOrd` 约束时，`>` 不能用于 `T`。
- **`where` 子句**：复杂约束用 `where` 提升可读性。
- **单态化（monomorphization）**：泛型在编译期为每个具体类型生成一份代码，运行时没有动态分发开销。
- **常见错误**：忘记加 trait bound 导致“cannot compare/ cannot add”类错误；类型参数数量不匹配（E0107）。

#### 代码示例

```rust
fn largest<T: PartialOrd + Copy>(list: &[T]) -> T {
    let mut largest = list[0];
    for &item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}

fn main() {
    let numbers = vec![34, 50, 25, 100];
    println!("{}", largest(&numbers)); // 100

    let chars = vec!['y', 'm', 'a', 'q'];
    println!("{}", largest(&chars));   // y
}
```

#### 常见坑

- 对泛型值做算术运算：需要 `T: std::ops::Add<Output = T>` 等约束。
- 以为泛型是“动态类型”：Rust 泛型在编译期单态化，类型错误在编译期暴露，不是运行时。

---

### C2. trait

#### 内容介绍

trait 定义一组方法签名，类型通过 `impl Trait for Type` 实现这些方法。trait 是 Rust 实现多态和约束泛型的主要机制。闭包的 `Fn`/`FnMut`/`FnOnce` 本质上也是 trait。

#### 详细描述

- **定义与实现**：trait 可以包含必需方法、默认方法、关联类型和关联常量。
- **`#[derive]` 属性**：`#[derive(Debug, Clone, PartialEq)]` 让编译器自动生成常见 trait 实现，是属性最常用的场景之一。
- **trait bound**：`fn foo<T: Summary>(item: T)` 或 `impl Summary` 参数语法。
- **trait 对象**：`Box<dyn Trait>` 实现动态分发；泛型是静态分发，trait 对象是动态分发。
- **孤儿规则（orphan rule）**：只能为“当前 crate 中定义的类型”或“当前 crate 中定义的 trait”实现，防止冲突。

#### 代码示例

```rust
trait Summary {
    fn summarize(&self) -> String;
}

#[derive(Debug)]
struct Article { title: String, author: String }

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("{}, by {}", self.title, self.author)
    }
}

// 静态分发：泛型 + trait bound
fn notify<T: Summary>(item: &T) {
    println!("Breaking: {}", item.summarize());
}

fn main() {
    let article = Article {
        title: String::from("Rust Traits"),
        author: String::from("Alice"),
    };
    notify(&article);

    // 动态分发：trait 对象
    let items: Vec<Box<dyn Summary>> = vec![Box::new(article)];
    for item in &items {
        println!("{}", item.summarize());
    }
}
```

#### 常见坑

- **实现 trait 时遗漏必需方法**：报 E0046。
- **调用 trait 方法时 trait 不在作用域**：需要 `use` 引入 trait，或者 trait 定义在同一模块中。
- 混淆 `impl Trait` 与 `dyn Trait`：前者是静态分发、编译期确定具体类型；后者是动态分发、有虚表开销。

---

### C3. 错误处理

#### 内容介绍

Rust 用 `Result<T, E>` 表示可恢复错误，用 `panic!` 表示不可恢复错误。`Option<T>` 表示可能缺失的值，常与 `Result` 配合完成“缺失 → 错误”的转换。

#### 详细描述

- **`Result` 的两个变体**：`Ok(T)` 和 `Err(E)`。
- **`?` 操作符**：在返回 `Result` 的函数中，`expr?` 等价于“`Ok` 则解包取值，`Err` 则提前返回 `Err(From::from(e))`”，会自动进行错误类型转换。
- **`Option` → `Result`**：`ok_or` / `ok_or_else` 把 `None` 转成自定义错误，便于 `?` 传播。
- **`unwrap`/`expect`**：适合原型和测试；生产代码中应尽量用 `?` 或 `match`。
- **自定义错误**：实现 `std::error::Error` + `Display`，或使用 `Box<dyn Error>` 作为通用错误类型。

#### 代码示例

```rust
use std::num::ParseIntError;

fn double_first(vec: &[&str]) -> Result<i32, ParseIntError> {
    let first = vec.first().ok_or_else(|| {
        // 实际项目中这里应返回自定义错误类型
        "empty".parse::<i32>().unwrap_err()
    })?;
    let n: i32 = first.parse()?; // ? 自动传播 ParseIntError
    Ok(n * 2)
}

fn main() {
    match double_first(&["10", "20"]) {
        Ok(v) => println!("{v}"),
        Err(e) => println!("error: {e}"),
    }
}
```

#### 常见坑

- **在返回 `()` 的函数中使用 `?`**：编译错误，`?` 要求外围函数返回 `Result` 或 `Option`。
- **错误类型不匹配**：`?` 会调用 `From`，如果目标错误类型没有实现相应转换，需要 `map_err` 手动转换。
- **滥用 `unwrap`**：在库代码或生产路径中，`unwrap` 会把可恢复错误变成 panic。

---

## 模块 D：标准库与工程化

### D1. 智能指针：Box / Rc / Arc

#### 内容介绍

三者都用于在堆上分配数据，但所有权语义不同：**`Box<T>` 单一所有者**；**`Rc<T>` 单线程多所有者（引用计数）**；**`Arc<T>` 多线程多所有者（原子引用计数）**。

#### 详细描述

| 类型 | 所有权 | 线程安全 | 典型场景 |
|---|---|---|---|
| `Box<T>` | 唯一 | 取决于 `T` | 递归类型、trait 对象、大对象装箱 |
| `Rc<T>` | 共享（单线程） | ❌ | 图结构、单线程共享配置 |
| `Arc<T>` | 共享（多线程） | ✅ | 跨线程共享只读数据 |

- **`Box<T>`**：实现了 `Deref`，可像 `&T` 一样使用；离开作用域自动释放堆内存。
- **`Rc<T>`**：`clone()` 增加引用计数，最后一个 `Rc` 离开时数据被释放；**只能单线程使用**，因为计数不是原子的。
- **`Arc<T>`**：`Rc` 的原子版本，可以跨线程 `clone` 和共享；通常与 `Mutex`/`RwLock` 配合实现多线程可变共享。
- **选择原则**：能用直接所有权就不用智能指针；需要多所有者时，单线程 `Rc`，多线程 `Arc`；需要 trait 对象或递归类型时 `Box`。

#### 代码示例

```rust
use std::rc::Rc;
use std::sync::Arc;

#[derive(Debug)]
enum List {
    Cons(i32, Box<List>),
    Nil,
}
use List::{Cons, Nil};

fn main() {
    // Box：递归类型
    let list = Cons(1, Box::new(Cons(2, Box::new(Nil))));
    println!("{:?}", list);

    // Rc：单线程共享
    let a = Rc::new(String::from("shared"));
    let b = Rc::clone(&a);
    println!("count = {}", Rc::strong_count(&a)); // 2

    // Arc：跨线程共享
    let data = Arc::new(vec![1, 2, 3]);
    let data2 = Arc::clone(&data);
    let handle = std::thread::spawn(move || {
        println!("from thread: {:?}", data2);
    });
    handle.join().unwrap();
    println!("from main: {:?}", data);
}
```

#### 常见坑

- **把 `Rc` 跨线程发送**：编译错误，`Rc` 不实现 `Send`。
- **用 `Arc` 但不加锁就想修改数据**：`Arc` 只提供共享所有权，可变性需要 `Mutex`/`RwLock`。
- **`Rc` 循环引用导致内存泄漏**：用 `Weak<T>` 打破环。

---

### D2. 集合与可选类型：Vec / HashMap / Option

#### 内容介绍

`Vec<T>` 是可增长的堆数组；`HashMap<K, V>` 是哈希表；`Option<T>` 是 `Some(T)`/`None` 的枚举，用于表示可选值。

#### 详细描述

- **`Vec<T>`**：`push`/`pop`/`iter`/`get`；可以用 `&v[..]` 借用为切片；`get(i)` 返回 `Option<&T>`，避免越界 panic。
- **`HashMap<K, V>`**：`insert`/`get`/`entry`；`entry` API 适合“存在则更新、不存在则插入”的场景。
- **`Option<T>`**：`map`、`and_then`、`unwrap_or`、`?`（在返回 `Option` 的函数中）。
- **`Option` 与 `Result` 的互转**：`ok_or`/`ok_or_else` 把 `None` 转成错误；`ok()` 把 `Result` 转成 `Option`。

#### 代码示例

```rust
use std::collections::HashMap;

fn main() {
    let mut v = vec![1, 2, 3];
    v.push(4);
    if let Some(x) = v.get(10) {
        println!("{x}");
    } else {
        println!("越界，但没 panic");
    }

    let mut scores = HashMap::new();
    scores.insert(String::from("Alice"), 90);
    scores.entry(String::from("Bob")).or_insert(80);

    let alice = scores.get("Alice").copied().unwrap_or(0);
    println!("Alice: {alice}");
}
```

#### 常见坑

- **`HashMap::get` 返回 `Option<&V>`**：需要 `copied()`/`cloned()` 才能得到值类型。
- **在遍历 `Vec` 的同时修改它**：借用规则会阻止，需要先收集索引或使用 `retain`/`drain`。

---

### D3. 闭包（从 trait 视角理解 Fn 家族）

#### 内容介绍

闭包是可以捕获环境的匿名函数。捕获方式决定了闭包实现哪个 trait：**`Fn`（不可变借用捕获）**、**`FnMut`（可变借用捕获）**、**`FnOnce`（按值捕获，只能调用一次）**。

#### 详细描述

- **自动推断**：编译器根据闭包体内对捕获变量的使用方式，选择**尽可能少限制**的 trait。只读 → `Fn`；需要修改 → `FnMut`；需要 move/drop → `FnOnce`。
- **`move` 关键字**：强制闭包按值捕获，常用于把闭包发送到线程或从函数返回闭包。
- **返回闭包**：必须用 `impl Fn(...)` 或 `Box<dyn Fn(...)>` 作为返回类型，因为闭包类型无法命名。
- **闭包与 trait bound**：接收闭包的泛型函数用 `F: Fn(i32) -> i32` 约束。

#### 代码示例

```rust
fn apply<F: FnOnce()>(f: F) {
    f();
}

fn create_fnmut() -> impl FnMut() {
    let mut count = 0;
    move || {
        count += 1;
        println!("count = {count}");
    }
}

fn main() {
    let greeting = "hello";
    let mut farewell = "goodbye".to_owned();

    let diary = || {
        println!("{greeting}");          // Fn：不可变借用
        farewell.push_str("!!!");        // FnMut：可变借用
        println!("{farewell}");
        drop(farewell);                  // FnOnce：按值消费
    };

    apply(diary); // FnOnce 可以接受 Fn/FnMut 闭包

    let mut counter = create_fnmut();
    counter();
    counter();
}
```

#### 常见坑

- **把 `FnOnce` 闭包传给要求 `Fn` 的函数**：编译错误，因为 `FnOnce` 可能消费捕获值，不能多次调用。
- **返回闭包时忘记 `move`**：捕获的局部变量在函数结束后失效，需要 `move` 把所有权移入闭包。
- 误以为 `move` 闭包总是 `FnOnce`：`move` 决定**如何捕获**，`Fn` 家族由**如何使用**决定；`move` 闭包仍可能是 `Fn`。

---

### D4. 模块与可见性（含 cfg 属性）

#### 内容介绍

模块系统用于组织代码和控制可见性。默认所有项是**私有**的；`pub` 及其变体（`pub(crate)`、`pub(super)`、`pub(in path)`）控制项可以被谁访问。

#### 详细描述

- **默认私有**：模块中的函数、结构体、字段默认只有当前模块及子模块可见。
- **`pub` 的传播性**：一个项要从 crate 外部访问，从根到该项的**每一层模块**都必须是 `pub` 的。
- **`pub(crate)`**：整个 crate 内可见，但不对外暴露；`pub(super)` 对父模块可见。
- **`pub use` 重导出**：把内部路径的项以更友好的路径暴露给外部。
- **`#[cfg(...)]` 属性**：条件编译，常用于 `#[cfg(test)] mod tests`、`#[cfg(target_os = "linux")]` 等场景。

#### 代码示例

```rust
mod outer {
    pub mod inner {
        pub fn public_api() {
            println!("public");
        }
        fn private_helper() {
            println!("private");
        }
    }

    pub(crate) fn crate_only() {
        println!("crate only");
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}

fn main() {
    outer::inner::public_api(); // ✅
    // outer::inner::private_helper(); // ❌ 私有
    outer::crate_only(); // ✅ crate 内可见
}
```

#### 常见坑

- **结构体字段默认私有**：`pub struct` 不会让字段自动公开，需要逐个字段加 `pub`，或提供构造函数。
- **`pub mod` 与 `pub use` 混淆**：`pub mod` 暴露模块路径；`pub use` 暴露项的重导出路径。
- 忘了 `#[cfg(test)]`：测试模块在生产构建中也会被编译，增加二进制体积。

---

## 附录：自测清单

| 主题 | 自测问题 |
|---|---|
| 所有权 | `let y = x;` 之后 `x` 在什么情况下仍可用？ |
| 借用 | 为什么“一个可变引用或多个不可变引用”能保证内存安全？ |
| 切片 | `&[T]` 的双字对象分别是什么？ |
| 字符串 | 函数参数为什么优先写 `&str` 而不是 `&String`？ |
| 泛型 | 不加 `PartialOrd` bound 时，`largest<T>` 为什么编译失败？ |
| trait | `impl Trait` 和 `dyn Trait` 的分发方式有何不同？ |
| 错误处理 | `?` 在错误分支实际执行了什么转换？ |
| 智能指针 | `Rc` 为什么不能跨线程？`Arc` 为什么能？ |
| 闭包 | `move` 闭包一定是 `FnOnce` 吗？ |
| 模块 | `pub(crate)` 与 `pub` 的可见范围差别是什么？ |

---

**最后一点建议**：你的列表本身说明你已经摸到了 Rust 的“硬骨头”。接下来最有效的巩固方式不是继续加知识点，而是**围绕所有权和借用把代码写到手熟**——绝大多数 trait、闭包、错误处理的困惑，最终都会回到“这个值现在归谁、借用关系是否合法”这两个问题上。
