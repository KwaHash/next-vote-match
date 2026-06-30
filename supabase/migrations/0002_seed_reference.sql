-- ============================================================
-- 初期リファレンス／サンプルデータ（任意）
--   - rules: 運営OSのルールエンジン7件（本番でも使用）
--   - elections / election_candidates / issues: プロトと同じサンプル（不要なら削除可）
-- ============================================================

-- ルールエンジン（運営OS）
insert into rules (id, name, description, severity, enabled) values
  ('R1','外国人寄付検知','外国籍・外国法人等からの寄付を検知（政治資金規正法22条の5：受領禁止）','高',true),
  ('R2','KYC・国籍確認','本人確認/国籍確認が未完了の寄付を要確認に振り分け','中',true),
  ('R3','寄付上限チェック','年間寄付額が上限を超える懸念を検知','高',true),
  ('R4','多重寄付・同一カード/IP検知','短時間の多重寄付、同一カード・同一IPからの寄付を検知','中',true),
  ('R5','支出証憑チェック（OCR）','証憑（領収書）未添付の支出を差戻し候補に','中',true),
  ('R6','関連当事者取引チェック','支出先が親族・関係会社等の利益相反の可能性を検知','高',true),
  ('R7','公開前PIIマスキング','選挙ページ・レポート・支援リソースの公開前に個人情報のマスキングを要求','中',true)
on conflict (id) do nothing;

-- 選挙（サンプル。本番は運営adminが取込・審査・公開）
insert into elections (id, name, type_label, region, postal_prefixes, election_date, official_url, is_published) values
  ('suginami-chiji','杉並区長選挙','市区町村長','東京都杉並区','{166,167,168}','2026-07-05','https://www.city.suginami.tokyo.jp/', true),
  ('osaka-chiji','大阪府知事選挙','都道府県知事','大阪府','{53,54,55,56,57,58,59}','2026-08-02','https://www.pref.osaka.lg.jp/', true)
on conflict (id) do nothing;

-- 候補者ロスター（サンプル・candidate_id は本人登録後に紐づけ）
insert into election_candidates (election_id, name, party, age, status, themes, finance, transparency, achievement, source, is_published) values
  ('suginami-chiji','区民 一郎','無所属','58','現職','{bosai,kosodate}','明確','高','区議3期・防災予算化','公式情報・運営確認済み', true),
  ('suginami-chiji','杉並 花子','中道改革','46','新人','{kosodate,ai-gyosei}','一部','中','NPO代表・待機児童ゼロ運動','本人入力', true),
  ('suginami-chiji','高円寺 健','無所属','51','新人','{nyusatsu,chiho-zaisei}','明確','高','公認会計士・行財政改革を提言','公式サイト・選挙公報', true),
  ('suginami-chiji','阿佐ヶ谷 みどり','れいわ新選','39','新人','{jinken,kosodate}','不明','中','市民活動家・子ども食堂運営','公開情報（一部未確認）', true),
  ('osaka-chiji','伊藤 さやか','日本維新','47','新人','{ai-gyosei,chiho-zaisei}','一部','中','府議2期','本人入力', true),
  ('osaka-chiji','森本 太一','無所属','55','現職','{energy,kanko}','明確','高','前市長・観光振興に実績','公式情報', true),
  ('osaka-chiji','大阪 直子','国民民主党','42','新人','{kosodate,nyusatsu}','明確','高','弁護士・行政監視','選挙公報', true);

-- 国と地域の課題（サンプル）
insert into issues (scope, theme_key, title, proposal, funnel_stage, donation_goal, youtube_id, is_published) values
  ('国','kosodate','出生数の減少と子育て負担の重さ','子育て世帯への継続支援パッケージ',2,3000000,'SAMPLE_KOSODATE', true),
  ('国','dx','行政手続きの煩雑さ','手続きのデジタル完結と二重行政の解消',2,1500000,'', true),
  ('東京都','kosodate','保育・学童の不足','保育・学童の整備と人材確保',2,2000000,'', true),
  ('大阪府','machi','万博後の跡地・施設の活用','跡地の長期活用とにぎわい維持',0,1500000,'', false);

-- ※ public_questions / candidate_question_answers のサンプルは、本番では国民側からの実投稿で蓄積するため省略。
--    デモ表示が必要なら別途 0003_seed_questions.sql を追加してください。
