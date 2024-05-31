import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import jaLocale from "@fullcalendar/core/locales/ja";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import {
  DatesSetArg,
  DayCellContentArg,
  EventContentArg,
} from "@fullcalendar/core";
import "../styles/Calendar.css";
import { Box } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import { isSameMonth } from "date-fns";
import useFilterCurrentMonthData from "../hooks/useFilterCurrentMonthData";
import { calculateDailyBalances } from "../utils/financeCalculations";
import { formatCurrency } from "../utils/formatting";
import { Balance, CalendarMoneyEvent, Health, Holiday, Todo } from "../types";
import { useMoneyContext } from "../context/MoneyContext";
import { useCommonContext } from "../context/CommonContext";
import { useTodoContext } from "../context/TodoContext";
import { useHealthContext } from "../context/HealthContext";

interface CalendarProps {
  currentDay: string;
  setCurrentDay: React.Dispatch<React.SetStateAction<string>>;
  toDay: string;
}

const Calendar = ({ currentDay, setCurrentDay, toDay }: CalendarProps) => {
  const [calendarCategory, setCalendarCategory] = useState<string>("all");
  const { setCurrentMonth, setIsMobileDrawerOpen } = useCommonContext();
  // Todo
  const { todoData, isTodoLoading, isTimeTakenLoading } = useTodoContext();
  const monthlyTodoData = useFilterCurrentMonthData(todoData);
  // Money
  const { moneyData, isMoneyLoading } = useMoneyContext();
  const monthlyMoneyData = useFilterCurrentMonthData(moneyData);
  const dailyBalances = calculateDailyBalances(monthlyMoneyData);
  // Health
  const { healthData, isHealthLoading } = useHealthContext();
  const monthlyHealthData = useFilterCurrentMonthData(healthData);
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  // 祝日APIから祝日を取得(3年分のデータのみ取得可能)
  // 【MEMO】ただの変数に値を格納したところ、再レンダリングされず、内容が反映されなかったため、holidaysをuseStateで管理
  React.useEffect(() => {
    axios
      .get<{ [date: string]: string }>(
        "https://holidays-jp.github.io/api/v1/date.json",
      )
      .then((response) => {
        const holidaysEvent = Object.entries(response.data).map(
          ([date, title]) => ({
            title,
            start: date,
            classNames: "holiday",
            display: "background",
          }),
        );
        setHolidays(holidaysEvent);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  // 収支を表示するためのイベントを作成
  const createCalendarMoneyEvents = (
    balances: Record<string, Balance>,
  ): CalendarMoneyEvent[] =>
    Object.keys(balances).map((date) => {
      const { income, expense, balance } = balances[date];
      return {
        start: `${date}T22:59`, // 時間順に並ぶ都合で、23時から-1分に設定することで、下に表示
        income: formatCurrency(income),
        expense: formatCurrency(expense),
        balance: formatCurrency(balance),
      };
    });
  // 呼び出し
  const CalendarMoneyEvents = createCalendarMoneyEvents(dailyBalances);

  // Todoを表示するためのイベントを作成
  const createCalendarTodoEvents = (todoEvents: Todo[]) =>
    todoEvents.map((data) => {
      let start = data.date;
      if (data.time !== "00:00:00" && data.time !== "00:00") {
        start += `T${data.time}`;
      }
      let dataType = "";
      switch (data.type) {
        case "仕事":
          dataType = "work";
          break;
        case "プライベート":
          dataType = "private";
          break;
        case "ルーティン":
          dataType = "routine";
          break;
        default:
          dataType = "work";
          break;
      }
      let classNames = `todo ${dataType}`;
      if (Number(data.completed) === 1) {
        classNames += " completed";
      }
      return {
        title: data.content,
        start,
        classNames,
      };
    });
  // 呼び出し
  const calendarTodoEvents = createCalendarTodoEvents(monthlyTodoData);

  // Healthを表示するためのイベントを作成
  const createCalendarHealthEvents = (healthEvents: Health[]) =>
    healthEvents.map((data) => ({
      start: `${data.date}T23:00`, // 時間順に並ぶ都合で、23時に設定することで、一番下に表示
      classNames: "health",
      headache: data.headache,
      stomach: data.stomach,
      period: data.period,
      sleepless: data.sleepless,
      cold: data.cold,
      nausea: data.nausea,
      hayfever: data.hayfever,
      depression: data.depression,
      tired: data.tired,
      other: data.other,
    }));
  const calendarHealthEvents = createCalendarHealthEvents(monthlyHealthData);

  // 選択中の日付の色背景色を設定するためのイベント
  const backgroundEvent = {
    start: currentDay,
    display: "background",
    backgroundColor: "#CCECFF",
    classNames: "currentDay",
  };

  // 表示中の月を変更したときに呼び出される関数
  const handleDateSet = (dateSetInfo: DatesSetArg) => {
    const currentMonth = dateSetInfo.view.currentStart;
    setCurrentMonth(currentMonth);
    // 表示中の月が現在の月であれば、現在の日付を更新(他の月の時には勝手に今日にしない)
    if (isSameMonth(new Date(), currentMonth)) {
      setCurrentDay(toDay);
    }
  };

  // 日付をクリックしたときに呼び出される関数
  const handleDateClick = (dateInfo: DateClickArg) => {
    setCurrentDay(dateInfo.dateStr);
    setIsMobileDrawerOpen(true);
  };

  // カレンダーの日付の表示から「日」を削除する
  const renderDayCell = (dayCellContent: DayCellContentArg) => {
    const { dayNumberText, isToday } = dayCellContent;
    const replaceDayNumberText = dayNumberText.replace("日", "");

    return isToday ? (
      <div className="calendar-todayNum">
        <span>{replaceDayNumberText}</span>
      </div>
    ) : (
      <>{replaceDayNumberText}</>
    );
  };

  // イベントの内容をカスタマイズ
  const renderEventContent = (eventInfo: EventContentArg) => (
    <>
      {eventInfo.event.classNames[0] === "health" ? (
        <div className="calendar-health">
          {Object.entries(eventInfo.event.extendedProps).map(
            ([key, value], index) => {
              if (value === 1) {
                return (
                  <span className="calendar-health-iconOuter" key={index}>
                    <img
                      className={`calendar-health-icon ${key}`}
                      src={`/icon/${key}.svg`}
                      alt={key}
                    />
                  </span>
                );
              }
              return null;
            },
          )}
        </div>
      ) : (
        <></>
      )}

      {eventInfo.event.classNames[0] === "holiday" &&
      eventInfo.event.title !== "" ? (
        <div className="calendar-holidayName">{eventInfo.event.title}</div>
      ) : (
        <></>
      )}

      {eventInfo.event.classNames[0] === "todo" &&
      eventInfo.event.title !== "" ? (
        <div className="calendar-todoItem">
          {eventInfo.timeText !== "" ? <span>{eventInfo.timeText} </span> : ""}
          <span>{eventInfo.event.title}</span>
        </div>
      ) : (
        <></>
      )}

      {eventInfo.event.extendedProps.income !== undefined &&
      eventInfo.event.extendedProps.income !== "0" ? (
        <div className="calendar-income">
          + {eventInfo.event.extendedProps.income}
        </div>
      ) : (
        <></>
      )}

      {eventInfo.event.extendedProps.expense !== undefined &&
      eventInfo.event.extendedProps.expense !== "0" ? (
        <div className="calendar-expense">
          - {eventInfo.event.extendedProps.expense}
        </div>
      ) : (
        <></>
      )}
    </>
  );

  // カレンダーの描画完了を検知するコールバック
  const handleViewDidMount = () => {
    const fcToolbars = document.querySelectorAll(".fc-toolbar-chunk");
    if (fcToolbars.length !== 0) {
      fcToolbars[1].classList.add("calendar-filter-buttons");
      fcToolbars[1].firstElementChild?.classList.add("calendar-button-active");
    }
  };

  // カテゴリによって表示するイベントを変更する関数
  const filterEventsByCategory = (category: string) => {
    switch (category) {
      case "todo":
        return [...calendarTodoEvents, ...holidays, backgroundEvent];
      case "money":
        return [...CalendarMoneyEvents, ...holidays, backgroundEvent];
      case "health":
        return [...calendarHealthEvents, ...holidays, backgroundEvent];
      default:
        return [
          ...calendarHealthEvents,
          ...CalendarMoneyEvents,
          ...calendarTodoEvents,
          ...holidays,
          backgroundEvent,
        ];
    }
  };

  // カテゴリボタンのスタイルを変更する関数
  const changeButtonStyle = (e: MouseEvent) => {
    if (e.target !== null) {
      const target = e.target as HTMLElement;
      target.parentNode?.childNodes.forEach((btn) => {
        const filterBtn = btn as HTMLElement;
        filterBtn.classList.remove("calendar-button-active");
      });
      target.classList.add("calendar-button-active");
    }
  };

  return (
    <Box>
      {isTodoLoading ||
      isTimeTakenLoading ||
      isHealthLoading ||
      isMoneyLoading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          p={3}
          sx={{ minHeight: "60vh" }}
        >
          <CircularProgress color="secondary" size={30} />
        </Box>
      ) : (
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={jaLocale}
          timeZone="Asia/Tokyo"
          events={filterEventsByCategory(calendarCategory)}
          eventContent={renderEventContent}
          datesSet={handleDateSet}
          dateClick={handleDateClick}
          dayCellContent={renderDayCell}
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5],
          }}
          eventDisplay="block"
          height={"auto"}
          viewDidMount={handleViewDidMount} // カレンダー描画完了の検知
          customButtons={{
            allButton: {
              text: "All",
              hint: "全て表示",
              click: (e) => {
                setCalendarCategory("all");
                changeButtonStyle(e);
              },
            },
            moneyButton: {
              text: "Money",
              hint: "収支のみ表示",
              click: (e) => {
                setCalendarCategory("money");
                changeButtonStyle(e);
              },
            },
            todoButton: {
              text: "ToDo",
              hint: "ToDoのみ表示",
              click: (e) => {
                setCalendarCategory("todo");
                changeButtonStyle(e);
              },
            },
            healthButton: {
              text: "Health",
              hint: "ヘルスのみ表示",
              click: (e) => {
                setCalendarCategory("health");
                changeButtonStyle(e);
              },
            },
          }}
          headerToolbar={{
            center: "allButton todoButton moneyButton healthButton",
          }}
        />
      )}
    </Box>
  );
};

export default Calendar;
