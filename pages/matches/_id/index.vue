<template>
  <div v-if="!$apollo.loading">
    <v-toolbar color="white" flat>
      <v-toolbar-title class="headline">{{
        $t('Match') + ': ' + match.competition.id + ' ' + match.name
      }}</v-toolbar-title>
    </v-toolbar>

    <v-alert type="info">
      {{ $t('How to submit a solution to this match') }}
      <v-tabs>
        <template v-for="e in examples">
          <v-tab :key="e.lang">{{ e.lang }}</v-tab>
          <v-tab-item :key="e.lang">
            <v-card>
              <v-card-text>
                <pre>{{ e.code }}</pre>
              </v-card-text>
            </v-card>
          </v-tab-item>
        </template>
      </v-tabs>
    </v-alert>
    <ul>
      <li>{{ $t('Created at') + ': ' + $dayjs(match.created_at).locale($i18n.locale).format('llll') }}</li>
      <li>{{ $t('Updated at') + ': ' + $dayjs(match.updated_at).locale($i18n.locale).format('llll') }}</li>
    </ul>

    <h2>{{ $t('Budget') }}</h2>
    <p v-html="$t('budget-text', { budget: match.budget })" />

    <h2>{{ $t('Environmental Variables') }}</h2>
    <p>{{ $t('envvar-text') }}</p>
    <v-data-table
      :headers="[
        { text: $t('Key'), value: 'key' },
        { text: $t('Value'), value: 'value' },
        { text: $t('Public'), value: 'public' },
        { text: $t('Created at'), value: 'created_at' },
        { text: $t('Updated at'), value: 'updated_at' },
      ]"
      :items="match.environments"
      :items-per-page="10"
      :loading="$apollo.loading"
      :footer-props="{
        'items-per-page-options': [10, 20, 50, 100],
        showFirstLastPage: true,
      }"
      multi-sort
      :locale="$i18n.locale"
      :loading-text="$t('loading')"
      :no-data-text="$t('no data')"
    >
      <template v-slot:item.key="{ item }">
        <code>{{ item.key }}</code>
      </template>
      <template v-slot:item.value="{ item }">
        <code>{{ item.value }}</code>
      </template>
      <template v-slot:item.public="{ item }">
        <code>{{ item.public }}</code>
      </template>
      <template v-slot:item.created_at="{ item }">
        {{ $dayjs(item.created_at).locale($i18n.locale).fromNow() }}
      </template>
      <template v-slot:item.updated_at="{ item }">
        {{ $dayjs(item.updated_at).locale($i18n.locale).fromNow() }}
      </template>
    </v-data-table>

    <template v-if="match.problem">
      <h2>{{ $t('Problem') + ': ' + match.problem.id }}</h2>
      <client-only>
        <mavon-editor
          v-if="$i18n.locale === 'en'"
          v-model="match.problem.description_en"
          language="en"
          default-open="preview"
          style="z-index: 1;"
          :box-shadow="false"
          :editable="false"
          :subfield="false"
          :toolbars-flag="false"
        />
        <mavon-editor
          v-if="$i18n.locale === 'ja'"
          v-model="match.problem.description_ja"
          language="ja"
          default-open="preview"
          style="z-index: 1;"
          :box-shadow="false"
          :editable="false"
          :subfield="false"
          :toolbars-flag="false"
        />
      </client-only>
      <ul>
        <li>{{ $t('Owner') + ': ' + match.problem.owner.name }}</li>
        <li>{{ $t('Created at') + ': ' + $dayjs(match.problem.created_at).locale($i18n.locale).fromNow() }}</li>
        <li>{{ $t('Updated at') + ': ' + $dayjs(match.problem.updated_at).locale($i18n.locale).fromNow() }}</li>
      </ul>
    </template>
    <template v-else>
      <h2>{{ $t('Problem') + ': ' + $t('(private)') }}</h2>
    </template>

    <template v-if="match.indicator">
      <h2>{{ $t('Indicator') + ': ' + match.indicator.id }}</h2>
      <client-only>
        <mavon-editor
          v-if="$i18n.locale === 'en'"
          v-model="match.indicator.description_en"
          language="en"
          default-open="preview"
          style="z-index: 1;"
          :box-shadow="false"
          :editable="false"
          :subfield="false"
          :toolbars-flag="false"
        />
        <mavon-editor
          v-if="$i18n.locale === 'ja'"
          v-model="match.indicator.description_ja"
          language="ja"
          default-open="preview"
          style="z-index: 1;"
          :box-shadow="false"
          :editable="false"
          :subfield="false"
          :toolbars-flag="false"
        />
      </client-only>
      <ul>
        <li>{{ $t('Owner') + ': ' + match.indicator.owner.name }}</li>
        <li>{{ $t('Created at') + ': ' + $dayjs(match.indicator.created_at).locale($i18n.locale).fromNow() }}</li>
        <li>{{ $t('Updated at') + ': ' + $dayjs(match.indicator.updated_at).locale($i18n.locale).fromNow() }}</li>
      </ul>
    </template>
    <template v-else>
      <h2>{{ $t('Problem') + ': ' + $t('(private)') }}</h2>
    </template>
  </div>
</template>

<script>
import getMatch from '~/apollo/queries/getMatch.gql'

export default {
  auth: false,

  data() {
    return {
      match: {},
      examples: [
        {
          lang: 'Shell',
          code: `$ echo 'YOUR_SOLUTION' | opt submit --match=${this.$route.params.id}`,
        },
        {
          lang: 'Python',
          code: `\
import json
from subprocess import check_output

def evaluate(x):
    json_x = json.dumps(x)  # Convert an object into a JSON string
    json_y = check_output(  # Submit a solution and recieve the result
        ["opt", "submit", "--match=${this.$route.params.id}"],
        input=json_x,  # Pass the solution via stdin
        text=True,  # Read stdout in text mode
    )
    y = json.loads(json_y)  # Convert a JSON string into a dict
    return y


if __name__ == "__main__":
    res = evaluate(YOUR_SOLUTION)
    print(res)`,
        },
        {
          lang: 'C++',
          code: `\
#include <iostream>
#include <fstream>
#include <cstdlib>
#include <string>
#include <iterator>
#include <array>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

std::string execute(std::string cmd) {
  std::string file_name = "result.json";
  std::system((cmd + " > " + file_name).c_str()); // redirect output to file

  // open file for input, return string containing characters in the file
  std::ifstream file(file_name);
  return {std::istreambuf_iterator<char>(file), std::istreambuf_iterator<char>()};
}

template<typename T>
json evaluate(const T& x) {
  json j = x;
  auto cmd = "echo '" + j.dump() + "' | opt submit --match=${this.$route.params.id}";
  auto s = execute(cmd);
  return json::parse(s);
}

int main() {
  std::cout << evaluate(YOUR_SOLUTION) << std::endl;
  return 0;
}`,
        },
        {
          lang: 'Java',
          code: `\
//  Main.java
//
// This shows how to use the opthub function in Java
//
// compile: javac Main.java --class-path  ./jackson-core-2.11.2.jar:./jackson-databind-2.11.2.jar:./jackson-annotations-2.11.2.jar
// run: java --class-path  .:./jackson-core-2.11.2.jar:./jackson-databind-2.11.2.jar:./jackson-annotations-2.11.2.jar Main
//
// The three jar files were downloaded from:
// https://mvnrepository.com/artifact/com.fasterxml.jackson.core/jackson-core
// https://mvnrepository.com/artifact/com.fasterxml.jackson.core/jackson-annotations
// https://mvnrepository.com/artifact/com.fasterxml.jackson.core/jackson-databind

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.io.IOException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;

public class Main {
    private static ObjectMapper mapper = new ObjectMapper();

    public static double objective(Object x) {
        // Encode x to the json format
        String json_x;
      	try {
	          json_x = mapper.writeValueAsString(x);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return Double.NaN;
        }

        // Submit a solution
        String path = "solution.json";
        try{
            File file = new File(path);
            FileWriter filewriter = new FileWriter(file);
            filewriter.write(json_x);
            filewriter.close();
        } catch (IOException e) {
            System.out.println(e);
            return Double.NaN;
        }
        String cmd = "opt submit --match=${this.$route.params.id} --solution=" + path;
        String json = "";
        try {
            Process proc = Runtime.getRuntime().exec(cmd);
            BufferedReader reader = new BufferedReader(new InputStreamReader(proc.getInputStream()));
            String line;
            while((line = reader.readLine()) != null) {
                json += line + "\\n";
            }
      	    proc.waitFor();   
      	} catch (RuntimeException | IOException | InterruptedException e) {
	          e.printStackTrace();
      	}
        // Decode the json file to a java object
        double y;
        try {
            y = mapper.readTree(json).get("objective").doubleValue();
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return Double.NaN;
        }
    	  return y;
    }

    public static void main(String[] args) {
        double f = objective(YOUR_SOLUTION_GOES_HERE);
        System.out.println("f(x) = " + f);
    }
}`,
        },
        {
          lang: 'MATLAB',
          code: `\
function f = objective(x)
    f = 0.0;
    str_x = string(x);  
    json_x = jsonencode(str_x);
    cmd_str = sprintf("echo '%s' | opt submit --match=${this.$route.params.id}", json_x); % Build an opt command
    [status, res] = system(cmd_str); % Submit a solution
    y = jsondecode(res);

    if status == 0
        f = y.objective;
    else
        error("Error. There is something wrong")
    end  
end`,
        },
      ],
    }
  },

  head() {
    return {
      title: this.$t('Match') + ' ' + this.$route.params.id,
    }
  },

  apollo: {
    match: {
      query: getMatch,
      variables() {
        return { id: this.$route.params.id }
      },
      update(data) {
        return data.matches_by_pk
      },
    },
  },
}
</script>

<i18n lang="yaml">
en:
  budget-text: "In this match, you can submit up to <code>{budget}</code> solutions to the competition server. Submittion comsumes the budget only when the solution is successfully evaluated and scored on the server. Solutions that raise errors during evaluation or scoring do not change the budget."
  envvar-text: "In this match, the problem and indicator shown below are instantiated with the following parameter values. Parameters not shown in the table are set to be some hidden values. For the description of parameters, see the problem and indicator sections below."
ja:
  How to submit a solution to this match: この問題に解を送信するには以下のコードを使用してください．
  budget-text: "この競技では，サーバに解を<code>{budget}</code>回まで送信できます．サーバで評価と採点の両方に成功した解のみが評価回数を消費します．評価や採点の途中にエラーが生じた解は評価回数にカウントされません．"
  envvar-text: "この競技では，下記の問題と指標を以下のパラメータ設定で使用しています．記載されていないパラメータには非公開の値が設定されています．パラメータの意味については，下記の問題と指標の説明をご確認ください．"
  Budget: 評価回数
  Environmental Variables: 環境変数
  Key: 名前
  Value: 値
  Problem: 問題
  Indicator: 指標
  Match: 競技
  Owner: 所有者
  Created at: 作成日時
  Updated at: 更新日時
  Public: 公開
  (private): （非公開）
</i18n>
